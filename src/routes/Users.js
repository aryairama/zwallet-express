const express = require('express');
const {
  registerFieldRules,
  PINRules,
  emailRules,
  changePasswordRules,
  loginFieldRules,
  rulesUpdateImageProfile,
  rulesFileUploud,
  rulesPassword,
  updateEmail,
  registerEmail,
  rulesRead,
  updatePassword,
  phoneNumberRules,
} = require('../validations/ValidatonUsers');
const resultOfValidation = require('../validations/ValidationResult');
const constrollerUsers = require('../controllers/ControllerUsers');
const { checkTokenResetPassword, checkTokenActivation } = require('../middlewares/checkToken');
const { Auth, Role } = require('../middlewares/Auth');

const router = express.Router();

router
  .get('/', Auth, Role('member', 'admin'), rulesRead(), resultOfValidation, constrollerUsers.readDataUser)
  .post('/', registerFieldRules(), rulesPassword(), registerEmail(), resultOfValidation, constrollerUsers.register)
  .put(
    '/',
    Auth,
    Role('member', 'admin'),
    rulesFileUploud,
    updateEmail(),
    rulesUpdateImageProfile(),
    registerFieldRules(),
    resultOfValidation,
    constrollerUsers.updateProfile,
  )
  .post('/login', loginFieldRules(), resultOfValidation, constrollerUsers.login)
  .delete('/logout', Auth, Role('member', 'admin'), constrollerUsers.logout)
  .post('/refreshtoken', constrollerUsers.refreshToken)
  .get('/activation/:token', checkTokenActivation, constrollerUsers.activateAccount)
  .get('/show/:id', Auth, Role('member', 'admin'), constrollerUsers.showUser)
  // Forgot password
  .post('/forgotpassword', emailRules(), resultOfValidation, constrollerUsers.forgotPW)
  .get('/forgotpassword/:token', checkTokenResetPassword, constrollerUsers.resetPW)
  .post('/changepassword', changePasswordRules(), resultOfValidation, constrollerUsers.changePassword)
  .post(
    '/updatepassword',
    Auth,
    Role('member', 'admin'),
    updatePassword(),
    resultOfValidation,
    constrollerUsers.updatePassword,
  )

  // main feature
  .post('/createpin', Auth, Role('member'), PINRules(), resultOfValidation, constrollerUsers.createPIN)
  .post('/updatepin', Auth, Role('member'), PINRules(), resultOfValidation, constrollerUsers.updatePin)
  .post(
    '/addphonenumber',
    Auth,
    Role('member', 'admin'),
    phoneNumberRules(),
    resultOfValidation,
    constrollerUsers.addPhoneNumber,
  )
  .post('/deletephonenumber', Auth, Role('member', 'admin'), constrollerUsers.deletePhoneNumber);

module.exports = router;
