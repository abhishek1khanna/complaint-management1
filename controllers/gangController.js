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
        
    const {gangLeaderID,gangLeaderName,gangName,gangMobile,tools_availabe,location,substation,feeder,security_equipment,latitude,longitude,substation_id} = req.body;
    if (!gangLeaderID) {

       return res.status(400).send({message:"All fields are required",status:false,statusCode:400,gang:[]});
    }
   

     const {_id} = req.encodedUser;
    
   // registrationDate = getDatePart(new Date());

    const gang = await new gangModel(
       { gangLeaderID,gangLeaderName,gangName,gangMobile,tools_availabe,location,substation,feeder,security_equipment,createdBy:_id, latitude,longitude,substation_id}
    ).save();
     return res.status(201).send({message:"gang created successfully",status:true,statusCode:201,gang:gang});
  } catch (error) {
    return res.status(500).send({message:"error occured in gang registration",status:false,statusCode:500,errorMessage:error});
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
            return res.status(201).send({message:"gang members added successfully",status:true,statusCode:201,gang:result});
        }).catch(err => {
            return res.status(400).send({message:"error",status:false,statusCode:400,errorMessage:err,gang:[]});
        });
    }catch(error){
     return res.status(500).send({message:"error occured in gang member updation",status:false,statusCode:500,errorMessage:error});
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
        // console.log(memberDetail);

        const originalDate = new Date();
        // const datePart = getDatePart(originalDate);

        await gangModel.findOneAndUpdate({ _id: gangID },{
            $pull : {
                members : { memberIDIs: memberID }
            }
        },{new : true}).then(result => {
            return res.status(201).send({message:"gang members updated successfully",status:true,statusCode:201,gang:result});
        }).catch(err => {
            return res.status(400).send({message:"error",status:false,statusCode:400,errorMessage:err,gang:[]});
        });
    }catch(error){
     return res.status(500).send({message:"error occured in gang member updation",status:false,statusCode:500,errorMessage:error,gang:[]});
    }
}


export const editGangController = (req, res) => {
    try{
        const {gangID,gangLeaderID,gangLeaderName,gangName,gangMobile,tools_availabe,location,substation,feeder,security_equipment,latitude,longitude,substation_id} = req.body;
        if (!gangID) {
            return res.status(400).send({message:"All fields are required",status:false,statusCode:400,gang:[]});
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
                security_equipment: security_equipment,
                latitude:latitude,
                longitude:longitude,
                substation_id:substation_id
            },{new : true}).then(result => {
            return res.status(201).send({message:"gang updated successfully",status:true,statusCode:201,gang:result});
        }).catch(err => {
            return res.status(400).send({message:"error in gang updation",status:false,statusCode:400,errorMessage:err,gang:[]});
        });
    }catch(err) {
        return res.status(500).send({message:"error occured in gang updation",status:false,statusCode:500,errorMessage:err,gang:[]});
    }
};

export const gangListController = async (req, res) => {
   

        var substationID = '';
        const {search} = req.body;

        const {_id} = req.encodedUser;
        var user = await userModel.findById(_id);
        if (user){
           substationID =  user.substation_id;
        }

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);


        if (!search) {
    
          
            try{
                const pageNumber = req.query.page || 1;
                const pageSize = req.query.pageSize || 50;
        
                gangModel.paginate({
                   substation_id:substationID// Filter records for the current month
                }, { page: pageNumber, limit: pageSize }, (err, result) => {
                if (err) {
                return res.status(200).send({message:"no record found",status:false,statusCode:200,errorMessage:err,gangs:[]});
                }else{
                 console.log(result);
                const { docs, totalDocs, limit, page, totalPages,prevPage,nextPage} = result;
                return res.status(200).send({ status:true,statusCode:200,gangs: docs, Total:totalDocs, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});
                }
                });
        
            }catch(error){
                return res.status(400).send({message:"no record found",status:false,statusCode:400,errorMessage:error,gangs:[]});
        
            }

        }else{
    
        try{

            const pageNumber = req.query.page || 1;
            const pageSize = req.query.pageSize || 50;
    
            const createdBy = req.body.createdBy;
    
            gangModel.paginate({$and:[{substation_id:substationID},
                {$or:[{gangName:{$regex:req.body.search}},{gangLeaderName:{$regex:req.body.search}},{substation:{$regex:req.body.search}},{gangMobile:{$regex:req.body.search}}]}
        ]}, { page: pageNumber, limit: pageSize }, (err, result) => {
            if (err) {
                return res.status(400).send({message:"error occured in gang member list",status:false,statusCode:400,errorMessage:err});
            }else{
            const { docs, total, limit, page, totalPages,prevPage,nextPage    } = result;
            return res.status(200).send({ status:true,statusCode:200,gangs: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});
            }
            });
    
        }catch(error){
                return res.status(400).send({message:"error occured in gang member list",status:false,statusCode:400,errorMessage:error});
        }
    }


}

