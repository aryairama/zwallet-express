import express from "express";
import {registerFieldRules, PINRules, emailRules, changePasswordRules} from "../validations/ValidatonUsers.js";
import resultOfValidation from "../validations/ValidationResult.js";
import constrollerUsers from '../controllers/ControllerUsers.js'
import { checkTokenResetPassword, checkTokenActivationPassword } from "../middlewares/checkToken.js";
const router = express.Router()

router
.post('/', registerFieldRules(), resultOfValidation, constrollerUsers.register)
.get('/activation/:token', checkTokenActivationPassword, constrollerUsers.activateAccount)
.get('/show/:id', constrollerUsers.showUser)
// Forgot password
.post('/forgotPassword', emailRules(), resultOfValidation, constrollerUsers.forgotPW)
.get('/forgotPassword/:token', checkTokenResetPassword, constrollerUsers.resetPW)
.post('/changePassword', changePasswordRules(), resultOfValidation,constrollerUsers.changePassword)

.post('/createPIN', PINRules(), resultOfValidation, constrollerUsers.createPIN)

export default router