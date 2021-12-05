const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const {
  getUserList, updateUser, searchUsers, changeUserStatus,
} = require('../controllers/user-controller');
const { authenticate } = require('../utils/middlewares/auth-middleware');

/* GET users listing. */
router.get('/', authenticate, getUserList);

router.post('/search', authenticate, searchUsers);

router.put(
  '/:userId',
  authenticate,
  body('firstName').notEmpty().withMessage('First Name Is Required.').isLength({ max: 50 })
    .withMessage('First Name cannot be more than 50 characters.'),
  body('lastName').notEmpty().withMessage('Last Name Is Required.').isLength({ max: 50 })
    .withMessage('Last Name cannot be more than 50 characters.'),
  body('password').optional()
    .isLength({ min: 6, max: 25 })
    .withMessage('Password length should be of 6 to 25 characters.'),
  updateUser,
);

router.put('/status/:userId', authenticate, body('status').notEmpty().withMessage('Status.'), changeUserStatus);

module.exports = router;
