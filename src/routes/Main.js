import express from 'express';
import resultOfValidation from '../validations/ValidationResult.js';
import ControllerMain from '../controllers/ControllerMain.js';
import {Auth, Role} from '../middlewares/Auth.js';
import {topUpFieldRules, rulesFileUploud, rulesCreateImgTopUp, statusRules} from '../validations/MainValidation.js';
const router = express.Router();

router
  .get('/alltransaction', ControllerMain.getAllTransaction)
  .post('/topup', rulesFileUploud, rulesCreateImgTopUp(), topUpFieldRules(), resultOfValidation, ControllerMain.topUp)
  .post('/updatetransaction', statusRules(), resultOfValidation, ControllerMain.updatetransaction);
export default router;
