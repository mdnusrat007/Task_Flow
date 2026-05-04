const express = require('express');
const router = express.Router();
const { signup, login, getProfile, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/users', protect, getUsers);

module.exports = router;
