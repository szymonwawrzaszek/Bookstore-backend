const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// exports.getRegister = (req, res, next) => {
//   res.render('./authentication/register', {
//       title: 'Register',
//       errors: [],
//       oldInput: {
//         email: ""
//       }
//   });
// }

exports.postRegister = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  try {
    if(!errors.isEmpty()){
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 401;
      throw error;
    }
    const findUser = await User.findOne({email: email});
    if(findUser){
     const error = new Error('User with this email address exist.');
     error.statusCode = 401;
     throw error;
   }
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      email: email,
      password: hashedPassword,
      userType: "new user",
      resetPasswordToken: {  }
    });
    const savedUser = await user.save();
    //console.log(savedUser)
    res.status(201).json({ message: 'User created!', userId: user._id });
    
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  } 
  };

// exports.getLogin = (req, res, next) => {
//   res.render('./authentication/login', {
//       title: 'Login',
//       error: '',
//       oldInput: {
//         email: ''
//       }
//   })
// }

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

 try {
  if(!errors.isEmpty()){
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 401;
    throw error;
  }
   let user = await User.findOne({email: email});
   if(!user){
    const error = new Error('Invalid credentials!');
    error.statusCode = 401;
    throw error;
  }
  const isEqual = await bcrypt.compare(password, user.password);
  if(isEqual){
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      'secretpasswordhash',
      { expiresIn: '1h' }
    );
    //console.log(user)
    res.status(200).json({token: token, userId: user._id.toString() + "-" + user.status})
  } else {
    const error = new Error('Invalid credentials!');
    error.statusCode = 401;
    throw error;
  }
 } catch (err) {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
 }
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    res.redirect('/books');
  })
}

