const User = require('../models/User')

const userController = {
    // get all user
    getAllUsers: async (req, res) => {
        try {
            const getData = await User.find();
            res.status(200).json(getData)
        } catch (error) {
            res.status(500).json(error)
        }
    },
    deleteUser : async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status('200').json('delete success')
        } catch (error) {
            res.status(500).json(error)
        }
    },
    getUser : async (req, res) => {
        try {
            const user = await User.findById(req.params.id)
            res.status('200').json(user)
        } catch (error) {
            res.status(500).json(error)
        }
    }
}

module.exports = userController