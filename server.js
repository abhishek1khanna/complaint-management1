import express from "express";
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import connectDB from "./config/conn.js";
import {errorHandler} from "./middleware/errorHandler.js";
import cors from 'cors';
dotenv.config();
const app = express();
app.use(express.json());
connectDB();

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, XMLHttpRequest, ngsw-bypass, Lng, Lang');
    next();
});



app.use('/api',  userRoutes  );
app.all('*', (req, res,next) => {
    const error = new Error(`cant find requested url ${req.url}`);
    error.statusCode = 404;
   next(error);
});


app.use(errorHandler);

app.listen(5000, () => {
    console.log(`Server is running on port ${port}`);
});
