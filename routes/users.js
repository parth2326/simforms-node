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

router.put('/:userId', authenticate, body('firstName').notEmpty().withMessage('First Name Is Required.'), body('lastName').notEmpty().withMessage('Last Name Is Required.'), body('password').optional()
  .isLength({ min: 6 })
  .withMessage('Password should be of atleast 6 letters.'), updateUser);

router.put('/status/:userId', authenticate, body('status').notEmpty().withMessage('Status.'), changeUserStatus);

module.exports = router;
