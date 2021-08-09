import express from 'express';
import resultOfValidation from '../validations/ValidationResult.js';
import ControllerMain from '../controllers/ControllerMain.js';
import {Auth, Role} from '../middlewares/Auth.js';
import {topUpFieldRules, rulesFileUploud, rulesCreateImgTopUp, statusRules, transferFielfRules} from '../validations/MainValidation.js';
const router = express.Router();

router
  .get('/alltransaction', Auth, Role('member', 'admin'), ControllerMain.getAllTransaction)
  .post('/topup', Auth, Role('member'), rulesFileUploud, rulesCreateImgTopUp(), topUpFieldRules(), resultOfValidation, ControllerMain.topUp)
  .post('/updatetransaction', statusRules(), resultOfValidation, ControllerMain.updatetransaction)
  .post('/transfer', Auth, Role('member'), transferFielfRules(), resultOfValidation, ControllerMain.transfer)
export default router;
