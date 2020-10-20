const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator/check');

const AuthController = require('../controllers/authentication-controller')
const isAuth = require('../middleware/is_auth')

// router.get('/register', AuthController.getRegister);
// router.get('/login', AuthController.getLogin);

router.post('/register', [
    check('email').isEmail().withMessage('Email field must be valid email!').normalizeEmail(),
    check('password').trim()
        .isLength({min: 8, max: 32}).withMessage('Password\'s length must be between 8 and 32 characters!')
        .isAlphanumeric().withMessage('Password must contains only alfanumeric characters!'),
    check('confirmPassword').trim().
        custom((value, {req}) => {
            if(value !== req.body.password){
                throw Error('Passwords have to match!');
            }
            return true;
        })    
], AuthController.postRegister);

router.post('/login', [
    check('email', 'Invalid credentials!').isEmail().normalizeEmail(),
    check('password', 'Invalid credentials!').trim().isLength({min: 8, max: 32}).isAlphanumeric(),
], 
AuthController.postLogin);

router.post('/logout', isAuth, AuthController.postLogout);

module.exports = router;