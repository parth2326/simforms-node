const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('../models/index');

/**
 * Signup API
 * @method POST
 * @param {*} firstName
 * @param {*} lastName
 * @param {*} email
 * @param {*} password
 * @returns
 */
exports.signup = async (req, res) => {
  // validate the user input
  const errors = validationResult(req).array().map((item) => item.msg);

  if (req.files && Object.keys(req.files).length > 0) {
    if (!['.jpg', '.png'].includes(path.extname(req.files.image.name).toLowerCase())) {
      errors.push('Only JPG/PNG Files allowed for display picture.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // check if the user with same email already exists
  const existingUserCount = await db.User.findOne({ where: { email: req.body.email.trim() } });
  if (existingUserCount) {
    return res.status(400).json({ errors: ['User with same email already is already registered. Please login.'] });
  }

  const userData = _.pick(req.body, ['firstName', 'lastName', 'email', 'password']);

  if (req.files && req.files.image) {
    const imageName = `${new Date().valueOf().toString()}-${req.files.image.name}`;
    req.files.image.mv(path.resolve(__dirname, `../public/images/${imageName}`));
    userData.displayPicture = `images/${imageName}`;
  }
  // hash the password and save the user into the database
  userData.password = bcrypt.hashSync(userData.password, 10);
  const createdUser = await db.User.create(userData);
  const loginHistory = await db.LoginHistory.create({ userId: createdUser.id, status: 'active' });

  // generate jwt token and return it
  const token = jwt.sign({ id: loginHistory.id }, process.env.JWT_PRIVATE_KEY);

  return res.status(200).json({
    token,
    user: createdUser,
  });
};

/**
 * Login API
 * @method POST
 * @param {*} email
 * @param {*} password
 */
exports.login = async (req, res) => {
  try {
    // validate the user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((item) => item.msg) });
    }

    const user = await db.User.findOne({
      where: { email: req.body.email.trim() },
    });

    // if user is not found or passwords doesnt match
    if (!user || bcrypt.compareSync(req.body.password, user.password) === false) {
      return res.status(400).json({ errors: ['Invalid Credentails'] });
    }

    if (user.status === 0) {
      return res.status(400).json({ errors: ['Your account is inactive'] });
    }

    const loginHistory = await db.LoginHistory.create({ userId: user.id, status: 'active' });

    // generate jwt token and return it
    const token = jwt.sign({ id: loginHistory.id }, process.env.JWT_PRIVATE_KEY);

    return res.status(200).json({
      token,
      user,
    });
  } catch (err) {
    return res.status(500).json({ errors: ['Failed to process your request.'] });
  }
};

exports.logout = async (req, res) => {
  try {
    const loginHistory = await db.LoginHistory.findOne({ where: { id: req.loginId } });

    if (loginHistory) {
      loginHistory.status = 'inactive';
      await loginHistory.save();
    }

    return res.json({
      message: 'User logged out successfully',
    });
  } catch (err) {
    return res.status(500).json({ errors: ['Failed to process your request.'] });
  }
};
