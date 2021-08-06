import response from '../helpers/helpers'

const register= (req, res) => {
    response.response(res, "success", 200, "Successfully")
}

const login = (req, res) => {

}

export default {
    register,
    login
}