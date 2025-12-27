import userService from "../services/user.js";
import authService from "../services/auth.js";
import { sendWelcomeEmail, sendEmailVerification } from "../utils/email.js";
import crypto from 'crypto';
import { create } from "domain";
const controller = {
    listUser: function(req, res, next){
        userService.findAll().then((users) => {
            res.json(users);
        }).catch(next);
    },

    getUser: async function(req, res, next){
        const {identifier, password} = req.body; // identifier can be username or email
        console.log('Login attempt with:', identifier);
        
        // Try to find user by username or email
        let found = await userService.getByUsername(identifier);
        if (!found) {
            found = await userService.getByEmail(identifier);
        }
        
        if (!found){
            return res.status(401).json({
                message: "Account does not exist"
            })
        }
        
        console.log('Validating password');
        const result = await authService.validatePassword(password, found.encryptedPassword);
        if(!result){
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }
        
        const token = await authService.generateToken({
            userId: found.id,
            username: found.username,
            email: found.email,
            role: found.role,
        }) 
        
        res.status(200).json({
            token,
            user: {
                userId: found.id,
                username: found.username,
                email: found.email,
                fullName: found.fullName,
                role: found.role,
                avatarUrl: found.avatarUrl,
            }
        })
    },

    createUser: async function(req, res){
        console.log(req.body);

        const { username, email, password, recaptchaToken } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        // Verify reCAPTCHA token
        if (recaptchaToken) {
            try {
                const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
                const response = await fetch(verificationUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
                });

                const data = await response.json();
                console.log('reCAPTCHA verification:', data);

                if (!data.success || data.score < 0.5) {
                    return res.status(400).json({
                        message: "reCAPTCHA verification failed"
                    });
                }
            } catch (error) {
                console.error('reCAPTCHA verification error:', error);
                return res.status(500).json({
                    message: "reCAPTCHA verification error"
                });
            }
        } else {
            return res.status(400).json({
                message: "reCAPTCHA token is required"
            });
        }

        const found = await userService.getByEmail(email);
        const foundUsername = await userService.getByUsername(username);
        if (found){
            return res.status(409).json({
                message: "Email already exists"
            })
        }
        if (foundUsername){
            return res.status(409).json({
                message: "Username already exists"
            })
        }

        // Generate verification code (must be exactly 6 digits for the CHECK constraint)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const result = await userService.create({
            username: username,
            email: email,
            encryptedPassword: await authService.hashPassword(password),
            otp: verificationCode,
            createdAt: new Date(),
        });

        try {
            // Send verification email
            console.log(`Attempting to send verification email to: ${email}`);
            await sendWelcomeEmail(email, username, verificationCode);
            console.log(`Verification email sent to ${email}`);
        } catch (error) {
            console.error('Failed to send verification email:', error);
            // Don't fail the registration if email fails
        }

        res.status(201).json({
            userId: result.id,
            username: result.username,
            email: result.email,
            message: "Registration successful. Please check your email to verify your account."
        });
    },
    validateEmail: async function(req, res){
        const { email, code } = req.body;
        console.log('Validating email for:', email);
        const found = await userService.getByEmail(email);
        if (!found){
            return res.status(404).json({
                message: "Account does not exist"
            })
        }
        if(found.otp !== code){
            return res.status(400).json({
                message: "Invalid verification code"
            })
        }
        if(found.role !== 'unauthorized'){
            return res.status(400).json({
                message: "Account is already verified"
            })
        }
        // Update role to buyer and clear OTP after successful validation
        await userService.update(found.id, { 
            otp: null,
            role: 'buyer'
        });
        res.status(200).json({
            message: "Email verified successfully. Your account is now active!"
        });
    },

    updateUser: function(req, res){
        const id = Number(req.params.id);
        const {body} = req;
        userService.getById(id).then((user) => {
            if(!user){
                res.status(404).json({
                    message: 'Account Not Found'
                });
            }
            else{
                userService.update(id, body).then((result) => {
                    if(result){
                        res.json(result);
                    }
                    else{
                        res.status(404).json({
                            message: 'Account Not Found'
                        });
                    }
                });
            }
        })    
        
    },

    deleteUser: function(req, res){
        const id = Number(req.params.id);
        UserService.getById(id).then((user) =>{
            if(!user){
                res.status(404).json({
                    message: 'Account Not Found'
                });
            }
            else{
                userService.delete(id).then((result) =>{
                    if(result){
                        res.json({});
                    }
                    else{
                        res.status(404).json({
                            message: 'Account Not Found'
                        });
                    }
                });
            }
        });
    },
    getCurrentUser: async function(req, res){
        const authorization = req.header('Authorization');
        // Authorization: Bearer ey...
        const token = authorization.replace('Bearer ', '').trim();
        // Validate Token
        try {
            const result = await authService.validateToken(token);
            res.status(200).json(result);
        } catch (error) {
            return res.status(401).json({
                message: 'Invalid Token',
            });
        }
    }
}

export default controller;