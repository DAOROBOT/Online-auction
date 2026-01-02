import { Router } from "express";
import userController from "../controllers/user.js";

const route = new Router();

// GET: Get all users with pagination (admin only)
route.get('/', userController.getAllUsers);

// GET: Get user statistics summary (admin only)
route.get('/stats', userController.getUserStatsSummary);

// GET: get current user profile (must be before /:id)
route.get('/me', userController.getCurrentUserProfile);

route.get('/profile/:username', userController.getUserProfile);

// GET: Get user by ID (admin only)
route.get('/:id', userController.getUserById);

// POST: Ban a user (admin only)
route.post('/:id/ban', userController.banUser);

// POST: Unban a user (admin only)
route.post('/:id/unban', userController.unbanUser);

// PUT: Update user role (admin only)
route.put('/:id/role', userController.updateUserRole);

export default route;
