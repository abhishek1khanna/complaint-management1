import complaintModel from "../models/complaintModel.js";
import gangModel from "../models/gangModel.js";
import userModel from "../models/userModel.js";

import {format} from 'date-fns';
import path from 'path';
import fs from 'fs';
const __dirname = path.resolve(path.dirname('')); 


function getDatePart(date) {
    return format(date, 'yyyy-MM-dd');
    // return date.toISOString().split('T')[0];
  }

export const addGangController = async (req,res,next) => {
    try{
        
    const {gangLeaderID,gangLeaderName,gangName,gangMobile,tools_availabe,location,substation,feeder,security_equipment} = req.body;
    if (!gangLeaderID) {

       res.status(400).send({message:"All fields are required",status:"failed",statusCode:400,gang:[]});
    }
   

     const {_id} = req.encodedUser;
    
   // registrationDate = getDatePart(new Date());

    const user = await new gangModel(
       { gangLeaderID,gangLeaderName,gangName,gangMobile,tools_availabe,location,substation,feeder,security_equipment,createdBy:_id }
    ).save();
     res.status(201).send({message:"gang created successfully",status:"success",statusCode:201,gang:user});
  } catch (error) {
    res.status(500).send({message:"error occured in gang registration",status:"failed",statusCode:500,errorMessage:error});
  }
}


export const addMembersMultipleController = async (req,res) =>{
    try{
        const {gangID,memberID} = req.body;
        console.log(memberID);
        // Find user details from User collection
        const users = await userModel.find({ _id: { $in: memberID } },{firstname,lastname,email,phone});
        console.log(users);

        const originalDate = new Date();
        // const datePart = getDatePart(originalDate);

        const updateResult = await gangModel.findOneAndUpdate(
            { gangID: gangID },
            { $addToSet: { members: { $each: users } } }
        );

        res.status(201).send({message:"gang members added successfully",status:"success"});
        

    }catch(err){
        res.status(500).send({message:"error",status:"false",err:err});
    }
}

export const addMembersSingleController = async (req,res) =>{
    try{
        const {gangID,memberID} = req.body;
        var user = await userModel.findById(memberID);
      
        if (user) {
            var memberDetail = {};
            memberDetail.memberIDIs = memberID;
            memberDetail.name = user.name;
            memberDetail.phone = user.phone;
            memberDetail.adharID = user.adharID;
            memberDetail.EPSICNumber = user.EPSICNumber;
            memberDetail.ITICertificateNumber = user.ITICertificateNumber;
        }
        
        const originalDate = new Date();
        // const datePart = getDatePart(originalDate);

        await gangModel.findOneAndUpdate({ _id: gangID },{
            $push : {
                members : memberDetail
            }
        },{new : true}).then(result => {
            res.status(201).send({message:"gang members added successfully",status:"success",statusCode:201,gang:result});
        }).catch(err => {
            res.status(400).send({message:"error",status:"failed",statusCode:400,errorMessage:err,gang:[]});
        });
    }catch(error){
     res.status(500).send({message:"error occured in gang member updation",status:"failed",statusCode:500,errorMessage:error});
    }
}


export const removeMembersController = async (req,res) =>{
    try{
        const {gangID,memberID} = req.body;
        var user = await userModel.findById(memberID);
      
        if (user) {
            var memberDetail = {};
            memberDetail.name = user.name;
            memberDetail.phone = user.phone;
            memberDetail.adharID = user.adharID;
            memberDetail.EPSICNumber = user.EPSICNumber;
            memberDetail.ITICertificateNumber = user.ITICertificateNumber;
        }
        console.log(memberDetail);

        const originalDate = new Date();
        // const datePart = getDatePart(originalDate);

        await gangModel.findOneAndUpdate({ _id: gangID },{
            $pull : {
                members : { memberIDIs: memberID }
            }
        },{new : true}).then(result => {
            res.status(201).send({message:"gang members updated successfully",status:"success",statusCode:201,gang:result});
        }).catch(err => {
            res.status(400).send({message:"error",status:"failed",statusCode:400,errorMessage:err,gang:[]});
        });
    }catch(error){
     res.status(500).send({message:"error occured in gang member updation",status:"failed",statusCode:500,errorMessage:error});
    }
}


export const editGangController = (req, res) => {
    try{
        const {gangID,gangLeaderID,gangLeaderName,gangName,gangMobile,tools_availabe,location,substation,feeder,security_equipment} = req.body;
        if (!gangID) {
            res.status(400).send({message:"All fields are required",status:"failed",statusCode:400,gang:[]});
        }
        const updateResult = gangModel.findOneAndUpdate(
            { _id: gangID },
            {
                gangLeaderID: gangLeaderID,
                gangLeaderName: gangLeaderName,
                gangName: gangName,
                gangMobile: gangMobile,
                tools_availabe: tools_availabe,
                location: location,
                substation: substation,
                feeder: feeder,
                security_equipment: security_equipment
            },{new : true}).then(result => {
            res.status(201).send({message:"gang updated successfully",status:"success",statusCode:201,gang:result});
        }).catch(err => {
            res.status(400).send({message:"error in gang updation",status:"failed",statusCode:400,errorMessage:err,gang:[]});
        });
    }catch(err) {
        res.status(500).send({message:"error occured in gang updation",status:"failed",statusCode:500,errorMessage:err});
    }
};

export const gangListController = (req, res) => {
   

   
        const {search} = req.body;


        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);


        if (!search) {
    
           
            try{
                const pageNumber = req.query.page || 1;
                const pageSize = req.query.pageSize || 50;
        
                gangModel.paginate({
                    createdAt: { $gte: firstDayOfMonth, $lte: now } // Filter records for the current month
                }, { page: pageNumber, limit: pageSize }, (err, result) => {
                if (err) {
                res.status(500).send({message:"error occured in gang member list",status:"failed",statusCode:500,errorMessage:error,gangs:[]});
                }else{
                const { docs, total, limit, page, totalPages,prevPage,nextPage    } = result;
                res.status(200).send({ gangs: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});
                }
                });
        
            }catch(error){
                res.status(500).send({message:"error occured in gang member list",status:"failed",statusCode:500,errorMessage:error,gangs:[]});
        
            }

        }else{
    
        try{

            const pageNumber = req.query.page || 1;
            const pageSize = req.query.pageSize || 50;
    
            const createdBy = req.body.createdBy;
    
            gangModel.paginate({$and:[{createdBy:createdBy},
                {$or:[{gangName:{$regex:req.body.search}},{gangLeaderName:{$regex:req.body.search}},{substation:{$regex:req.body.search}},{gangMobile:{$regex:req.body.search}}]}
        ]}, { page: pageNumber, limit: pageSize }, (err, result) => {
            if (err) {
                res.status(500).send({message:"error occured in gang member list",status:"failed",statusCode:500,errorMessage:err});
            }else{
            const { docs, total, limit, page, totalPages,prevPage,nextPage    } = result;
            res.status(200).send({ gangs: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});
            }
            });
    
        }catch(error){
                res.status(500).send({message:"error occured in gang member list",status:"failed",statusCode:500,errorMessage:error});
        }
    }


}

