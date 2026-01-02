import authService from "../services/auth.js";
import userService from "../services/user.js";
import sellerRequestService from "../services/sellerRequest.js";

// Verify token and attach user to request
export const verifyToken = async (req, res, next) => {
    try {
        const authorization = req.header('Authorization');
        
        // if (!authorization) {
        //     return res.status(401).json({
        //         message: 'Authorization header missing',
        //     });
        // }

        // Authorization: Bearer ey...
        const token = authorization?.replace('Bearer ', '').trim();

        if (token) {
            // Validate Token
            const tokenData = await authService.validateToken(token);
            
            // Fetch fresh user data from database
            const user = await userService.getById(tokenData.userId);
            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                });
            }

            // Check seller status - if seller role has expired, revert to buyer
            if (user.role === 'seller') {
                const statusCheck = await sellerRequestService.checkAndUpdateSellerStatus(user.id);
                if (statusCheck.status === 'expired' && statusCheck.reverted) {
                    user.role = 'buyer';
                    console.log(`User ${user.id} seller status expired, reverted to buyer`);
                }
            }

            // Attach user to request object
            req.user = user;
            console.log('User verified successfully:', user.id);
        }
        
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid Token',
        });
    }
};

// Check if user has required role(s)
// export const requireRole = (...allowedRoles) => {
//     return (req, res, next) => {
//         if (!req.user) {
//             return res.status(401).json({
//                 message: 'User not authenticated',
//             });
//         }

//         if (!allowedRoles.includes(req.user.role)) {
//             return res.status(403).json({
//                 message: 'Insufficient permissions. Required roles: ' + allowedRoles.join(', '),
//             });
//         }

//         next();
//     };
// };

// Middleware for seller-only routes
export const requireSeller = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: 'User not authenticated',
        });
    }

    if (req.user.role !== 'seller') {
        return res.status(403).json({
            message: 'Only sellers can access this resource',
        });
    }

    next();
};

// Middleware for buyer-only routes
export const requireBuyer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: 'User not authenticated',
        });
    }

    if (req.user.role !== 'buyer') {
        return res.status(403).json({
            message: 'Only buyers can access this resource',
        });
    }

    next();
};

// Middleware for admin-only routes
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: 'User not authenticated',
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Only admins can access this resource',
        });
    }

    next();
};

export default verifyToken;
