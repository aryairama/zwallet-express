import express from "express";
import {registerFieldRules, PINRules} from "../validations/ValidatonUsers.js";
import resultOfValidation from "../validations/ValidationResult.js";
import constrollerUsers from '../controllers/ControllerUsers.js'
const router = express.Router()

router
.post('/', registerFieldRules(), resultOfValidation, constrollerUsers.register)
.get('/activation/:token', constrollerUsers.activateAccount)
.post('/createPIN', PINRules(), resultOfValidation, constrollerUsers.createPIN)

export default router