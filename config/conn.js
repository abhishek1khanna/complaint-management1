import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB =  (req,res) => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected to ${process.env.MONGODB_URI}`);
    }catch(err){
        console.log(err);
    }
    
}

export default connectDB;