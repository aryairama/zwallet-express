import express from "express";
import constrollerUsers from '../controllers/ControllerUsers'
const router = express.Router()

router
.get('/', constrollerUsers.register)

export default router