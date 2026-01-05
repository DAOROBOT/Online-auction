import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import auctionRoute from "./routes/auction.js";
import authRoute from "./routes/auth.js"
import categoryRoute from "./routes/category.js"
import searchRoute from "./routes/search.js";
import sellerRequestRoute from "./routes/sellerRequest.js"
import userRoute from "./routes/user.js"
import error_handler from "./middleware/error_handler.js";
import not_found from "./middleware/not_found.js";


// import productRoute from "./routes/product.routes.js";

const app = express();

// --- Dependencies ---
app.use(cors());

app.use(morgan('dev'));

app.use(bodyParser.json());

// Session for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());

// --- Routes ---
app.use('/auction', auctionRoute);
app.use('/auth', authRoute);
app.use('/categories', categoryRoute);
app.use('/search', searchRoute);
app.use('/seller', sellerRequestRoute);
app.use('/user', userRoute);

// --- Middleware ---
app.use(error_handler);
app.use(not_found);



// app.use('/api/products', productRoutes);


export default app;