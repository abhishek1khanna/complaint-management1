// import asyncHandler from "express-async-handler";
import userModel from "../models/userModel.js";
import JWT from 'jsonwebtoken';
import { hashPassword,comparePassword, generateToken } from "../utils/util.js";

export const registerController = async (req,res,next) => {
    try{
    const {name,username,email,password,phone,role,adharID,EPSICNumber,ITICertificateNumber,substation_id} = req.body;
    if (!name || !username || !email || !password  || !phone  || !role ) {

       res.status(400).send({message:"All fields are required",status:"false",statusCode:400,user:[]});
    }
    //const encPassword = await hashPassword(password);
    //req.body.password = encPassword;
    const user = await new userModel(req.body).save();
    res.status(201).send({message:"user created successfully",status:"true",statusCode:201,user:user});
  } catch (error) {
    res.status(500).send({message:"error occured in user registration",status:"false",statusCode:500,user:[],errorMessage:error});
  }
}



export const loginController = async (req,res,next) => {

    try{
    const {username,password} = req.body;
    if (!username || !password ) {
        return res.status(400).send({message:"All fields are required",status:false,statusCode:400,user:[]});
    }
    const user = await userModel.findOne({username:username,password:password});
    if (!user) {
        return res.status(404).send({message:"User not found",status:false,statusCode:404,user:[]});
    }
    /* const isMatch = await comparePassword(password,user.password);
    if (!isMatch) {
         res.status(401).send({message:"invalid password",status:"failed",statusCode:401,user:[]});
    } */

    const token = await generateToken(user._id);
    return res.status(200).send({message:"user logged in successfully",status:true,statusCode:200,user:user,token:token});
    }catch(error){
        return res.status(500).send({message:"error occured in user login",status:false,statusCode:500,user:[],errorMessage:error});
    }
};

export const logoutController = async (req, res) => {
    try{
        //req.session.destroy();
       // res.clearCookie("cookieName");
       // ls.clear('userDetail');

       // const tokenStr = req.headers.authorization;
      //  const token = tokenStr.split(' ')[1];
         const {_id} = req.encodedUser;
         const token = await generateToken(_id);
       //  await JWT.destroy(token);

        res.status(200).send({success: true,message: "logout successful"});
    }catch(err){
        res.status(400).send({error: err.message});
    }
    res.status(200).send({success: true});
}

export const userListController = async (req,res,next) => {

    try{
        const pageNumber = req.query.page || 1;
        const pageSize = req.query.pageSize || 25;

        userModel.paginate({}, { page: pageNumber, limit: pageSize }, (err, result) => {
        if (err) {
            res.status(404).send({message:"Error occurred while fetching users",status:"failed",statusCode:404,users:[]});
        }
        const { docs, total, limit, page, totalPages,prevPage,nextPage    } = result;
        res.status(200).send({ users: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});
        });

    }catch(error){
        res.status(500).send({message:"error occured in user list",status:"failed",statusCode:500,errorMessage:error});
    }
  

};


export const updateUserController = async (req,res,next) => {
    try{

    const {name,username,email,password,phone,role,adharID,EPSICNumber,ITICertificateNumber,substation_id} = req.body;

    if (!name || !username || !email || !password  || !phone  || !role ) {

        res.status(400).send({message:"All fields are required",status:"failed",statusCode:400,user:[]});

    }

    const {_id} = req.encodedUser;
    const user = await userModel.findByIdAndUpdate(_id,req.body,{new:true});
    if(!user){
        res.status(404).send({message:"User not found",status:"failed",statusCode:404,user:[]});
    }
     res.status(200).send({message:"User updated",status:"success",statusCode:200,user:user});
    
    }catch(error){
        res.status(500).send({message:"error occured in user updation",status:"failed",statusCode:500,errorMessage:error});

    }    
};

export const searchController = async (req,res,next) => {
   
    try{

        const pageNumber = req.query.page || 1;
        const pageSize = req.query.pageSize || 25;

        const {search} = req.body;

        if (!search) {
             res.status(400).send({message:"missing search paremeters",status:"failed",statusCode:400,user:[]});
        }
    

        userModel.paginate({$or:[{firstname:{$regex:req.body.search}},{lastname:{$regex:req.body.search}},{email:{$regex:req.body.search}},{phone:{$regex:req.body.search}}]}, { page: pageNumber, limit: pageSize }, (err, result) => {
            if (err) {
                res.status(404).send({message:"Error occurred while fetching users",status:"failed",statusCode:404,users:[]});
            }
            const { docs, total, limit, page, totalPages,prevPage,nextPage    } = result;
            res.status(200).send({ users: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage,status:"success",statusCode:200});
            });
    

    
    }catch(error){
        res.status(500).send({message:"error occured in user list",status:"failed",statusCode:500,errorMessage:error});
    }
   

} ;



export const mobileLoginController = async (req, res) => {

    try{
    const { otp, mobile_number } = req.body;
     if (!otp || !mobile_number ) {
        return res.status(404).send({message:"fields can not be left blank",status:false,statusCode:404,user:[]});
    }
    const user = await userModel.findOne({phone:mobile_number,"otp.token":otp});
    if (!user) {
       return res.status(404).send({message:"User not found",status:false,statusCode:404,user:[]});
    }
    let otpData = user.otp;
    
    const currentDateTime = new Date();
    const expiry_time = new Date(otpData.expiry_time);

    if (otp == otpData.token && currentDateTime.getTime() <= expiry_time.getTime()) {
       
        const token = await generateToken(user._id);
        
        return res.status(200).send({message:"user logged in successfully",status:true,statusCode:200,user:user,token:token});

    }else{
         return res.status(400).json({ message: 'Invalid OTP', statusCode: 400,status:false,user:[] });
    }

    }catch(e){
        return res.status(500).send({message:"error occured in user login",status:false,statusCode:500,errorMessage:e,user:[]});
    }

}


function generateOTP() {
    let otp = Math.floor(Math.random() * 1000000);
    otp = otp.toString().padStart(6, '0');
    return otp;
}

export const getOTPController = (req, res) => {
    const { mobile_number } = req.body;
    // Find the mobile_number in the database
    userModel.findOne({ phone: mobile_number })
        .then(async (user) => {

            if (!user) {
                return res.status(400).send({ message: 'Mobile Number does not exist.', statusCode:400,status: false });
            }
            const otp = generateOTP();
            const dateTime = new Date();
            const expiry_time = new Date(dateTime.getTime() + 5 * 60 * 1000); // Add 5 minutes in milliseconds

            userModel.findOneAndUpdate(
                { phone: mobile_number },
                { $set: { otp: { token: otp, expiry_time: expiry_time.toISOString() } } }

            ).then((result) => {
                return res.status(200).send({ otp, message: 'Otp has been sent successfully on your mobile no.', statusCode: 200, status:true });
            })
                .catch((error) => {
                    return res.status(400).send({ message: 'Internal server error. ', statusCode: 400, status:false,errorMessage:error });
                });
        })
        .catch((error) => {
            console.error("Error finding user:", error);
            return res.status(400).json({ message: 'Internal server error. ', statusCode: 400,status:false,errorMessage:error });
        });
};

