import sellerRequestService from "../services/sellerRequest.js";
import userService from "../services/user.js";
import authService from "../services/auth.js";

const controller = {
    // Submit a seller upgrade request (for buyers)
    submitRequest: async function(req, res) {
        try {
            // Get user from token
            const authorization = req.header('Authorization');
            if (!authorization) {
                return res.status(401).json({ message: 'Authorization required' });
            }

            const token = authorization.replace('Bearer ', '').trim();
            const userData = await authService.validateToken(token);

            if (!userData || !userData.userId) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            // Check if user is a buyer
            const user = await userService.getById(userData.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.role === 'seller') {
                return res.status(400).json({ message: 'You are already a seller' });
            }

            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Admins cannot request seller upgrade' });
            }

            if (user.isVerified === false) {
                return res.status(400).json({ message: 'Please verify your email first' });
            }

            // Check for existing pending request
            const hasPending = await sellerRequestService.hasPendingRequest(userData.userId);
            if (hasPending) {
                return res.status(400).json({ message: 'You already have a pending request' });
            }

            const { reason } = req.body;

            // Create the request
            const request = await sellerRequestService.create(userData.userId, reason || '');

            res.status(201).json({
                message: 'Seller upgrade request submitted successfully',
                request: {
                    id: request.id,
                    status: request.status,
                    createdAt: request.createdAt,
                }
            });
        } catch (error) {
            console.error('Submit seller request error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },

    // Get current user's request status
    getMyRequest: async function(req, res) {
        try {
            const authorization = req.header('Authorization');
            if (!authorization) {
                return res.status(401).json({ message: 'Authorization required' });
            }

            const token = authorization.replace('Bearer ', '').trim();
            const userData = await authService.validateToken(token);

            if (!userData || !userData.userId) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            const request = await sellerRequestService.getByUserId(userData.userId);

            res.status(200).json({ request });
        } catch (error) {
            console.error('Get my request error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },

    // Get all requests (admin only)
    getAllRequests: async function(req, res) {
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

            const { status } = req.query;
            const requests = await sellerRequestService.findAll(status || null);

            res.status(200).json({ requests });
        } catch (error) {
            console.error('Get all requests error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },

    // Approve a request (admin only)
    approveRequest: async function(req, res) {
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
            const { adminNote } = req.body;

            const request = await sellerRequestService.getById(parseInt(id));
            if (!request) {
                return res.status(404).json({ message: 'Request not found' });
            }

            if (request.status !== 'pending') {
                return res.status(400).json({ message: 'This request has already been processed' });
            }

            // Update request status
            await sellerRequestService.updateStatus(parseInt(id), 'approved', adminNote);

            // Update user role to seller
            await userService.update(request.userId, { role: 'seller' });

            res.status(200).json({ 
                message: 'Request approved successfully. User is now a seller.',
                request: {
                    id: parseInt(id),
                    status: 'approved'
                }
            });
        } catch (error) {
            console.error('Approve request error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },

    // Reject a request (admin only)
    rejectRequest: async function(req, res) {
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
            const { adminNote } = req.body;

            const request = await sellerRequestService.getById(parseInt(id));
            if (!request) {
                return res.status(404).json({ message: 'Request not found' });
            }

            if (request.status !== 'pending') {
                return res.status(400).json({ message: 'This request has already been processed' });
            }

            // Update request status
            await sellerRequestService.updateStatus(parseInt(id), 'rejected', adminNote);

            res.status(200).json({ 
                message: 'Request rejected.',
                request: {
                    id: parseInt(id),
                    status: 'rejected'
                }
            });
        } catch (error) {
            console.error('Reject request error:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },
};

export default controller;
