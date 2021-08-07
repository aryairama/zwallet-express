import express from "express";
import {registerFieldRules, PINRules, emailRules} from "../validations/ValidatonUsers.js";
import resultOfValidation from "../validations/ValidationResult.js";
import constrollerUsers from '../controllers/ControllerUsers.js'
const router = express.Router()

router
.post('/', registerFieldRules(), resultOfValidation, constrollerUsers.register)
.get('/activation/:token', constrollerUsers.activateAccount)
.post('/forgotPassword', emailRules(), resultOfValidation, constrollerUsers.forgotPW)
.post('/createPIN', PINRules(), resultOfValidation, constrollerUsers.createPIN)

export default router