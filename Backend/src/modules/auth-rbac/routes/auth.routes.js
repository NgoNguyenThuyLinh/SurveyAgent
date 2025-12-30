// src/modules/auth-rbac/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimit.middleware');
const isDev = process.env.NODE_ENV === 'development';

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
// Disable or relax rate limiting in development to avoid 429s during testing
router.post(
	'/login',
	isDev ? (req, res, next) => next() : rateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts, please try again later.' }),
	authController.login
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
	'/forgot-password',
	isDev ? (req, res, next) => next() : rateLimiter({ windowMs: 60 * 60 * 1000, max: 5 }),
	authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get('/google', authController.googleAuth);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google Auth Callback
 * @access  Public
 */
router.get('/google/callback', authController.googleCallback);

/**
 * @route   POST /api/auth/creator-upgrade
 * @desc    Upgrade current user to creator
 * @access  Private
 */
router.post('/creator-upgrade', authenticate, authController.upgradeToCreator);

module.exports = router;
