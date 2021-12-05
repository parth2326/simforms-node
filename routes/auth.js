const express = require('express');
const { body } = require('express-validator');

const { authenticate } = require('../utils/middlewares/auth-middleware');
const { signup, login, logout } = require('../controllers/auth-controller');

const router = express.Router();

/* GET users listing. */
router.post('/login', body('email').notEmpty().withMessage('Email Is Required.').isEmail()
  .withMessage('Email Address Is Not Valid.'), body('password').notEmpty().withMessage('Password Is Required.').isLength({ min: 6 })
  .withMessage('Password should be of atleast 6 letters.'), login);

router.post(
  '/signup',
  body('firstName').notEmpty().withMessage('First Name Is Required.').isLength({ max: 50 })
    .withMessage('First Name cannot be more than 50 characters.'),
  body('lastName').notEmpty().withMessage('Last Name Is Required.').isLength({ max: 50 })
    .withMessage('Last Name cannot be more than 50 characters.'),
  body('email').notEmpty().withMessage('Email Is Required.').isEmail()
    .withMessage('Email Address Is Not Valid.'),
  body('password').notEmpty().withMessage('Password Is Required.').isLength({ min: 6, max: 25 })
    .withMessage('Password length should be of 6 to 25 characters.'),
  signup,
);

router.get('/logout', authenticate, logout);

module.exports = router;
