import express from "express";
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import connectDB from "./config/conn.js";
import {errorHandler} from "./middleware/errorHandler.js";
import cors from 'cors';
import path from 'path';
dotenv.config();
const app = express();
app.use(express.json());
connectDB();

const port = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join('', 'uploads')));

// const serverURL = `${req.protocol}://${req.get('host')}`; //http://localhost:5000
// const avatarPath = `http://localhost:5000/${user.id}/${newFileName}`; //http://localhost:5000/64fb0a40db0abdff97117746/avatar-64fb0a40db0abdff97117746.jpeg

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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
