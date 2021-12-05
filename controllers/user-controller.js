const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const path = require('path');
const Sequelize = require('sequelize');
const db = require('../models');

const { Op } = Sequelize;

/**
 * Get All Users List
 * @method GET
 */
exports.getUserList = async (req, res) => {
  try {
    const userList = await db.User.findAll({});
    return res.json(userList);
  } catch (err) {
    return res.status(500).json({ errors: ['Failed to process your request.'] });
  }
};

/**
 * Update User API
 * @method PUT
 * @param firstName
 * @param lastName
 * @param image
 * @param password
 * @param userId (route params)
 */
exports.updateUser = async (req, res) => {
  try {
  // validate the user input
    const errors = validationResult(req).array().map((item) => item.msg);

    if (req.files && req.files.image != null) {
      if (!['.jpg', '.png'].includes(path.extname(req.files.image.name).toLowerCase())) {
        errors.push('Only JPG/PNG Files allowed for display picture.');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // check if the user with id already exists
    const user = await db.User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      return res.status(400).json({ errors: ['Provided User doesn\'t exist.'] });
    }

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;

    // update the password if provided
    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, 10);
    }

    // update the image if provided
    if (req.files && req.files.image) {
      const imageName = `${new Date().valueOf().toString()}-${req.files.image.name}`;
      req.files.image.mv(path.resolve(__dirname, `../public/images/${imageName}`));
      user.displayPicture = `images/${imageName}`;
    }

    await user.save();

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ errors: ['Failed to process your request.'] });
  }
};

/**
 * Search User API
 * @method POST
 * @param pageIndex
 * @param pageSize
 * @param sortField
 * @param sortOrder
 * @param search
 * @param status
 */
exports.searchUsers = async (req, res) => {
  try {
  // default sort
    const sortQuery = [['createdAt', 'DESC']];

    let whereQuery = [];

    // if the sort is applied
    if (req.body.sortField && ['createdAt', 'firstName', 'lastName', 'email', 'status'].includes(req.body.sortField)) {
      sortQuery[0][0] = req.body.sortField;
      sortQuery[0][1] = req.body.sortOrder === 'ascend' ? 'ASC' : 'DESC';
    }

    // if the search is applied
    if (req.body.search && req.body.search.trim().length > 0) {
      whereQuery = [
        {
          [Op.or]: [
            Sequelize.where(Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')), {
              [Op.like]: `%${req.body.search}%`,
            }),
            {
              email: { [Op.like]: `%${req.body.search}%` },
            },
          ],
        },
      ];
    }

    // if the filter of status is applied
    if (req.body.status && req.body.status.length > 0 && ['0', '1'].includes(req.body.status.toString())) {
      whereQuery.push({
        status: req.body.status,
      });
    }

    const pageNo = req.body.pageIndex || 1;
    const pageSize = req.body.pageSize || 10;

    const results = await db.User.findAll({
      where: whereQuery, order: sortQuery, offset: ((pageNo - 1) * pageSize), limit: pageSize,
    });
    const totalResults = await db.User.count({ where: whereQuery });

    return res.json({
      results,
      totalResults,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: ['Failed to process your request.'] });
  }
};

/**
 * Change User Status API
 * @method PUT
 * @param {*} userId (route params)
 * @param {*} status (body)
 */
exports.changeUserStatus = async (req, res) => {
  try {
    const errors = validationResult(req).array().map((item) => item.msg);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // check if the user with id already exists
    const user = await db.User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      return res.status(400).json({ errors: ['Provided User doesn\'t exist.'] });
    }

    user.status = req.body.status;
    await user.save();

    // mark all auth keys as inactive if the status is 0
    if (req.body.status.toString() === '0') {
      await db.LoginHistory.update({ status: 'inactive' }, { where: { userId: req.params.userId } });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ errors: ['Failed to process your request.'] });
  }
};
