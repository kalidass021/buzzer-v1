import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectMongoDB from './db/connectMongoDB.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';


const app = express();
// dot env configuration
dotenv.config();
// port
const PORT = process.env.PORT || 5000;

// allow json as input to the backend
// body parser
app.use(express.json()); // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use(cookieParser()); // extracting cookies from the browser

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// middleware to handle the errors
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

app.listen(PORT, () => {
  console.log(`Server is up and listening on port ${PORT}`);
  connectMongoDB();
});
