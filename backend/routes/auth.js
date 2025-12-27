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

// GET: get current user
route.get('/me', authController.getCurrentUser);

// ==================== Google OAuth ====================
route.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

route.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login?error=google_failed' }),
    async (req, res) => {
        try {
            // Generate JWT token for the authenticated user
            const token = await authService.generateToken({
                userId: req.user.id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
            });
            
            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
        }
    }
);

// ==================== Facebook OAuth ====================
route.get('/facebook', passport.authenticate('facebook', { 
    scope: ['email'] 
}));

route.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login?error=facebook_failed' }),
    async (req, res) => {
        try {
            // Generate JWT token for the authenticated user
            const token = await authService.generateToken({
                userId: req.user.id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
            });
            
            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('Facebook callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
        }
    }
);

export default route;