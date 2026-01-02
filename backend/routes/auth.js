import { Router } from "express";
import passport from "../config/passport.js";
import authController from "../controllers/auth.js"
import authService from "../services/auth.js";

const route = new Router();

// POST: register
route.post('/register', authController.createUser);

// POST: login
route.post('/login', authController.getUser);

// POST: validate email
route.post('/validate', authController.validateEmail);

// POST: resend verification code
route.post('/resend-verification', authController.resendVerification);

// POST: forgot password (send OTP)
route.post('/forgot-password', authController.forgotPassword);

// POST: verify reset OTP
route.post('/verify-reset-otp', authController.verifyResetOtp);

// POST: reset password
route.post('/reset-password', authController.resetPassword);

// GET: get current user
route.get('/', authController.verifyUser);

// ==================== Google OAuth ====================
route.get('/google', authController.authenticateGoogle);

route.get('/google/callback', authController.callbackGoogle);

// ==================== Facebook OAuth ====================
route.get('/facebook', authController.authenticateFacebook);

route.get('/facebook/callback', authController.callbackFacebook);

export default route;