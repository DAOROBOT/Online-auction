import userService from "../services/user.js";
import authService from "../services/auth.js";

const controller = {
    // Get all users with pagination, filtering, and search (admin only)
    getAllUsers: async function(req, res) {
        try {
            const authorization = req.header('Authorization');
            if (!authorization) {
                return res.status(401).json({ message: 'Authorization required' });
            }

            const token = authorization.replace('Bearer ', '').trim();
            const userData = await authService.validateToken(token);

            if (!userData || userData.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }

            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                role = '', 
                status = '' 
            } = req.query;

            const result = await userService.findAllPaginated({
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                role,
                status
            });

            res.status(200).json(result);
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },

    // Get user by ID with stats (admin only)
    getUserById: async function(req, res) {
        try {
            const authorization = req.header('Authorization');
            if (!authorization) {
                return res.status(401).json({ message: 'Authorization required' });
            }

            const token = authorization.replace('Bearer ', '').trim();
            const userData = await authService.validateToken(token);

            if (!userData || userData.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }

            const { id } = req.params;
            const user = await userService.getById(parseInt(id));

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Get user stats
            const stats = await userService.getUserStats(parseInt(id));

            res.status(200).json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    status: user.status,
                    avatarUrl: user.avatarUrl,
                    bio: user.bio,
                    birthday: user.birthday,
                    createdAt: user.createdAt,
                    isVerified: user.isVerified,
                    ratingCount: user.ratingCount,
                    positiveRatingCount: user.positiveRatingCount,
                },
                stats
            });
        } catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },

    // Ban a user (admin only)
    banUser: async function(req, res) {
        try {
            const authorization = req.header('Authorization');
            if (!authorization) {
                return res.status(401).json({ message: 'Authorization required' });
            }

            const token = authorization.replace('Bearer ', '').trim();
            const userData = await authService.validateToken(token);

            if (!userData || userData.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }

            const { id } = req.params;
            const user = await userService.getById(parseInt(id));

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot ban an admin user' });
            }

            if (user.status === 'banned') {
                return res.status(400).json({ message: 'User is already banned' });
            }

            const bannedUser = await userService.banUser(parseInt(id));

            res.status(200).json({
                message: 'User has been banned successfully',
                user: {
                    id: bannedUser.id,
                    username: bannedUser.username,
                    status: bannedUser.status
                }
            });
        } catch (error) {
            console.error('Ban user error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },

    // Unban a user (admin only)
    unbanUser: async function(req, res) {
        try {
            const authorization = req.header('Authorization');
            if (!authorization) {
                return res.status(401).json({ message: 'Authorization required' });
            }

            const token = authorization.replace('Bearer ', '').trim();
            const userData = await authService.validateToken(token);

            if (!userData || userData.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }

            const { id } = req.params;
            const user = await userService.getById(parseInt(id));

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.status === 'active') {
                return res.status(400).json({ message: 'User is not banned' });
            }

            const unbannedUser = await userService.unbanUser(parseInt(id));

            res.status(200).json({
                message: 'User has been unbanned successfully',
                user: {
                    id: unbannedUser.id,
                    username: unbannedUser.username,
                    status: unbannedUser.status
                }
            });
        } catch (error) {
            console.error('Unban user error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },

    // Update user role (admin only)
    updateUserRole: async function(req, res) {
        try {
            const authorization = req.header('Authorization');
            if (!authorization) {
                return res.status(401).json({ message: 'Authorization required' });
            }

            const token = authorization.replace('Bearer ', '').trim();
            const userData = await authService.validateToken(token);

            if (!userData || userData.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }

            const { id } = req.params;
            const { role } = req.body;

            if (!['unauthorized', 'buyer', 'seller', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }

            const user = await userService.getById(parseInt(id));

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await userService.update(parseInt(id), { role });

            res.status(200).json({
                message: 'User role updated successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    role: role
                }
            });
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },

    // Get user statistics summary (admin only)
    getUserStatsSummary: async function(req, res) {
        try {
            const authorization = req.header('Authorization');
            if (!authorization) {
                return res.status(401).json({ message: 'Authorization required' });
            }

            const token = authorization.replace('Bearer ', '').trim();
            const userData = await authService.validateToken(token);

            if (!userData || userData.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }

            const allUsers = await userService.findAll();

            const stats = {
                total: allUsers.length,
                byRole: {
                    unauthorized: allUsers.filter(u => u.role === 'unauthorized').length,
                    buyer: allUsers.filter(u => u.role === 'buyer').length,
                    seller: allUsers.filter(u => u.role === 'seller').length,
                    admin: allUsers.filter(u => u.role === 'admin').length,
                },
                byStatus: {
                    active: allUsers.filter(u => u.status === 'active' || !u.status).length,
                    banned: allUsers.filter(u => u.status === 'banned').length,
                }
            };

            res.status(200).json({ stats });
        } catch (error) {
            console.error('Get user stats summary error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },
    getCurrentUserProfile: async function(req, res) {
        try {
            const authorization = req.header('Authorization');
            if (!authorization) {
                return res.status(401).json({ message: 'Authorization required' });
            }
            console.log('Authorization header:', authorization);
            const token = authorization.replace('Bearer ', '').trim();
            const userData = await authService.validateToken(token);
            if (!userData) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            console.log('Validated user data:', userData);
            const user = await userService.getById(userData.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const auctions = await userService.getUserAuctions(userData.userId, user.role);
            console.log('User auctions data:', auctions);
            res.status(200).json({
                id: user.id,
                username: user.username,
                name: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatarUrl,
                bio: user.bio,
                birthDate: user.birthday,
                createdAt: user.createdAt,
                rating: {
                    positive: user.positiveRatingCount || 0,
                    negative: (user.ratingCount || 0) - (user.positiveRatingCount || 0),
                    percentage: user.ratingCount > 0 
                        ? Math.round((user.positiveRatingCount / user.ratingCount) * 100) 
                        : 100,
                },
                // Auction data matching frontend expectations
                activeListings: auctions.activeListings,
                soldItems: auctions.soldItems,
                wonAuctions: auctions.wonAuctions,
                activeBids: auctions.activeBids,
                favoriteProducts: auctions.favoriteProducts,
            });
        } catch (error) {
            console.error('Get current user profile error:', error);
            
            // Handle JWT errors specifically
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
            }
            
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    }
};

export default controller;
