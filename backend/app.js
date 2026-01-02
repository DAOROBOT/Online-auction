import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import auctionRoute from "./routes/auction.js";
import searchRoute from "./routes/search.js";
import categoryRoute from "./routes/category.js"
import authRoute from "./routes/auth.js"
import sellerRequestRoute from "./routes/sellerRequest.js"
import userRoute from "./routes/user.js"
import not_found from "./middleware/not_found.js";
import error_handler from "./middleware/error_handler.js";


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
app.use(passport.session());

app.use('/auction', auctionRoute);
app.use('/auth', authRoute);
app.use('/search', searchRoute);
app.use('/categories', categoryRoute);
app.use('/seller', sellerRequestRoute);
app.use('/users', userRoute);

// --- Product route ---
// app.use('/products', productRoute);
app.get('/', (req, res) => {
    res.json({
        message: 'Hello World',
    });
});

// --- Middleware ---
app.use(not_found);
app.use(error_handler);



// app.use('/api/products', productRoutes);


export default app;