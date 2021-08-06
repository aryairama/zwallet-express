import express from "express";
import constrollerUsers from '../controllers/ControllerUsers.js'
const router = express.Router()

router
.get('/', constrollerUsers.register)

export default router