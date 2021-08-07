import { response } from '../helpers/helpers.js';
import { register as queryRegister } from '../models/Users.js';
import bcrypt from 'bcrypt';

const register = (req, res) => {
  const { username, email, password } = req.body;
};

const login = (req, res) => {};

export default {
  register,
  login,
};
