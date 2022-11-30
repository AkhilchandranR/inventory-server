const express = require('express');
const { registerUser, loginUser, 
    logout, getUser, loginStatus, 
    updateUser, changePassword } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/register', registerUser);
router.post('/login' , loginUser);
router.get('/logout' , logout);
router.get('/getUser' ,protect, getUser);
router.get('/loggedin' , loginStatus);
router.patch('/updateuser' , protect,updateUser);
router.patch('/updatepassword', protect,changePassword);

module.exports = router;