import { response } from '../helpers/helpers.js';

const register = (req, res) => {
  response(res, 'success', 200, 'Successfully');
};

const login = (req, res) => {};

export default {
  register,
  login,
};
