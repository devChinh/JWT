const router = require('express').Router()
const middlewareController = require('../controllers/middlewareController')
const userController = require('../controllers/userControllers')

// Get all user 
router.get('/', userController.getAllUsers)

// delete user 
router.delete('/:id' , middlewareController.verifyTokenAndAdminAuth , userController.deleteUser)

// get user
router.get('/:id' , userController.getUser)

module.exports = router