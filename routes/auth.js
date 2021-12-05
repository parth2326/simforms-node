const express = require('express');
const { body } = require('express-validator');

const { authenticate } = require('../utils/middlewares/auth-middleware');
const { signup, login, logout } = require('../controllers/auth-controller');

const router = express.Router();

/* GET users listing. */
router.post('/login', body('email').notEmpty().withMessage('Email Is Required.').isEmail()
  .withMessage('Email Address Is Not Valid.'), body('password').notEmpty().withMessage('Password Is Required.').isLength({ min: 6 })
  .withMessage('Password should be of atleast 6 letters.'), login);

router.post('/signup', body('firstName').notEmpty().withMessage('First Name Is Required.'), body('lastName').notEmpty().withMessage('Last Name Is Required.'), body('email').notEmpty().withMessage('Email Is Required.').isEmail()
  .withMessage('Email Address Is Not Valid.'), body('password').notEmpty().withMessage('Password Is Required.').isLength({ min: 6 })
  .withMessage('Password should be of atleast 6 letters.'), signup);

router.get('/logout', authenticate, logout);

module.exports = router;
