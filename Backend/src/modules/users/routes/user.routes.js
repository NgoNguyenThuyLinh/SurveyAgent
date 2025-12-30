// src/modules/users/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const { authenticate, isTeacherOrAdmin, isAdmin } = require('../../../middleware/auth.middleware');

// Protected routes
router.post('/', authenticate, isAdmin, userController.createUser);
router.get('/', authenticate, isTeacherOrAdmin, userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);

module.exports = router;
