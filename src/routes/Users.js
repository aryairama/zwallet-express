import express from "express";
import {registerFieldRules} from "../validations/ValidatonUsers.js";
import resultOfValidation from "../validations/ValidationResult.js";
import constrollerUsers from '../controllers/ControllerUsers.js'
const router = express.Router()

router
.post('/', registerFieldRules(), resultOfValidation, constrollerUsers.register)

export default router