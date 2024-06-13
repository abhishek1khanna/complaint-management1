import complaintModel from "../models/complaintModel.js";
import {format} from 'date-fns';
import userModel from "../models/userModel.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import complaintAgencyModel from "../models/complaintAgencyModel.js";
import gangModel from "../models/gangModel.js";
import haversine from 'haversine';
const __dirname = path.resolve(path.dirname('')); 


function getDatePart(date) {
    return format(date, 'yyyy-MM-dd');
    // return date.toISOString().split('T')[0];
  }

export const makeDirController = (req,res) => {
    const filePath = path.join(__dirname,'./public/test');
    try{
        fs.mkdirSync(filePath);
        console.log('Directory created successfully');
        res.status(200).send({message:'Directory created successfully'});
    }catch(err){
        res.status(500).send({error: err.message});
    }
    

}




export const addComplaintController = async (req,res,next) => {
    try{
    const {complaintNo,complaintType,source,accountID,serviceOrderNo,area,consumerDetail,substationID,remark} = req.body;
    if (!complaintNo || !complaintType || !source || !accountID  || !serviceOrderNo || !area || !consumerDetail || !substationID || !remark) {

         res.status(400).send({message:"All fields are required",status:"failed",statusCode:400,complaint:[]});
    }
    const {_id} = req.encodedUser;
    var staffRemarks = [{
        remark : remark,
        date : new Date(),
        addedBy : _id,
    }];
    console.log(_id);

    /* consumerDetail = {};
    consumerDetail.name = 'abhishek';
    consumerDetail.mobileNo = '9621977190';
    consumerDetail.type = 'urgent';
    consumerDetail.source = 'phone call';
    consumerDetail.district = 'kanpur nagar';
    consumerDetail.substation = 'geeeta nagae';
    consumerDetail.subDivision = 'geeta nagae';
    consumerDetail.circle = 'cube';
    consumerDetail.zone = 'blue zone'; */

    const registrationDate = getDatePart(new Date());

    const user = await new complaintModel(
       { createdBy:_id,complaintNo,complaintType,source,accountID,serviceOrderNo,area,consumerDetail,substationID,staffRemarks,registrationDate }
    ).save();
    res.status(201).send({message:"complaint created successfully",status:"success",complaint:user});
  } catch (error) {
    const errormsg = new Error(error.message);
    errormsg.statusCode = 400;
    next(errormsg);
  }
}



export const updateComplaintController = async (req, res) => {
    try{
        
        const {_id} = req.encodedUser;
        var requestBy = '';
        var requestByID = '';

         var userDetail = await userModel.findById(_id);
        if(userDetail){
            requestBy = userDetail.name;
            requestByID = userDetail._id;
        }
        
       //  console.log('reqqqqqq',requestBy,requestByID);

        const {complaintID,complaintStatus,staff_remark,self_remark,assign_to,shutdown_start_time,shutdown_end_time} = req.body;
        if (!complaintID) {
            return res.status(400).send({message:"All fields are required",status:false,statusCode:400,complaint:[]});
        }
         var complaintDataIs = await complaintModel.findById(complaintID); 
         if(!complaintDataIs){
            return res.status(404).send({message:"complaint not found",status:false,statusCode:404,complaint:[]});

         }
            if (complaintStatus){
                const updateResult = await complaintModel.findOneAndUpdate(
                { _id: complaintID },
                {
                    complaintStatus: complaintStatus
                });
            }
            if (staff_remark){
                const originalDate = new Date();
                // const datePart = getDatePart(originalDate);

                await complaintModel.findByIdAndUpdate(complaintID,{
                $push : {
                    staffRemarks : {
                        remark : staff_remark,
                        date : originalDate,
                         remarkBy : requestBy,
                         remarkByID : requestByID
                    }
                }
                });
            }
            if (self_remark){
                const originalDate = new Date();
                // const datePart = getDatePart(originalDate);

                await complaintModel.findByIdAndUpdate(complaintID,{
                $push : {
                    selfRemarks : {
                        remark : self_remark,
                        date : originalDate,
                         remarkBy : requestBy,
                         remarkByID : requestByID
                    }
                }
                });
            }
            if (assign_to){
                
                 var gang = await gangModel.findById(assign_to);
                 

                if(gang){
        
                await complaintModel.findByIdAndUpdate(complaintID,{
                $set : {
                gangDetail : {
                    gangId :  gang._id,
                    gangName : gang.gangName,
                    gangMobileNo : gang.gangMobile,
                    gangSubstation : gang.substation
                },
                complaintStatus:"Assigned" 
            }});
                }
            }
            if (shutdown_start_time != undefined && shutdown_end_time != undefined){

                // var user = await userModel.findById(requested_by);
                
                if(1==1){
                     await complaintModel.findByIdAndUpdate(complaintID,{
                    $push : {
                            shutdown : {
                            startTime : shutdown_start_time,
                            endTime : shutdown_end_time,
                            requestBy : requestBy,
                            requestByID : requestByID,
                        }
                    }});
                }
            }
             //  console.log('filesss1',req.file);
             //  console.log('filesss2',req.files); 
            if (req.files) {

                const fileArr = req.files;
                fileArr.forEach(async (file) => {
                    
                    const filePath = file.path;
                    const fileName = file.filename;
                    
                    await complaintModel.findByIdAndUpdate(complaintID,{
                        $push : {
                            siteDocuments : {
                                documentName : fileName,
                                uploadDate : new Date(),
                                documentURL : filePath,
                                uploadBy:requestBy,
                                uploadByID : requestByID,
                            }
                        }
                    });
                });
                
              /*  console.log('filesss',req.file);
                const filePath = req.file.path;
                const fileName = req.file.filename;
                
                await complaintModel.findByIdAndUpdate(complaintID,{
                    $push : {
                        siteDocuments : {
                            documentName : fileName,
                            uploadDate : new Date(),
                            documentURL : filePath,
                            uploadBy:requestBy,
                            uploadByID : requestByID,
                        }
                    }
                }); */


            }
            
            const complaintData = await complaintModel.findById(complaintID);
            return res.status(201).send({message:"complaint updated successfully",status:true,statusCode:201,complaint:complaintData});
           
        }
        catch(err) {
        return res.status(400).send({message:"error occured in complaint status updation",status:false,statusCode:400,errorMessage:err,complaint:[]});
        }
};

export const updateComplaintStatusController = async (req, res) => {
    try{
        const {complaintID,complaintStatus} = req.body;
        if (!complaintID) {
            res.status(400).send({message:"All fields are required",status:"failed",statusCode:400,complaint:[]});
        }
        const updateResult = await complaintModel.findOneAndUpdate(
            { _id: complaintID },
            {
                complaintStatus: complaintStatus,
            },{new : true}).then(result => {
            res.status(201).send({message:"complaint status updated successfully",status:"success",statusCode:201,complaint:result});
        }).catch(err => {
            res.status(400).send({message:"error in complaint status updation",status:"failed",statusCode:400,errorMessage:err,complaint:[]});
        });
    }catch(err) {
        res.status(500).send({message:"error occured in complaint status updation",status:"failed",statusCode:500,errorMessage:err,complaint:[]});
    }
};



export const addStaffRemarksController = async (req,res) =>{
    try{
        const {complaintID,remark} = req.body;

        const originalDate = new Date();
        // const datePart = getDatePart(originalDate);

        await complaintModel.findByIdAndUpdate(complaintID,{
            $push : {
                staffRemarks : {
                    remark : remark,
                    date : originalDate,
                    remarkBy : '1',
                }
            }
        },{new : true},).then(result => {
            res.status(201).send({message:"remark added successfully",status:"success",user:result});
        }).catch(err => {
            const errormsg = new Error(err.message);
            errormsg.statusCode = 400;
            next(errormsg);
        })
    }catch(err){
        const errormsg = new Error(err.message);
        errormsg.statusCode = 400;
        next(errormsg);
    }
}

export const addSelfRemarksController = async (req,res) =>{
    try{
        const {complaintID,remark} = req.body;

        const originalDate = new Date();
        const datePart = getDatePart(originalDate);
        // console.log(datePart);

        await complaintModel.findByIdAndUpdate(complaintID,{
            $push : {
                selfRemarks : {
                    remark : remark,
                    date : originalDate,
                    remarkBy : '1',
                }
            }
        },{new : true}).then(result => {
            res.status(201).send({message:"remark added successfully",status:"success",user:result});
        }).catch(err => {
            const errormsg = new Error(err.message);
            errormsg.statusCode = 400;
            next(errormsg);
        })
    }catch(err){
        const errormsg = new Error(err.message);
        errormsg.statusCode = 400;
        next(errormsg);
    }
}


export const assignComplainController = async (req, res) => {


     try{
        const {complain_no,gang_id} = req.body;

        var user = await gangModel.findById(gang_id);
        if(user){
            // console.log(user.firstname);
        
       await complaintModel.findByIdAndUpdate(complain_no,{
            $set : {
                gangDetail : {
                    gangId :  user._id,
                    gangName : user.gangName,
                    gangMobileNo : user.gangMobile,
                    gangSubstation : user.substation
                },
                 complaintStatus:"Assigned" 
            }
        },{new : true}).then(result => {
            return res.status(200).send({message:"complaint assigned successfully",status:true,statusCode:200});
        }).catch(err => {
            return res.status(400).send({message:"error in complaint assignment",status:false,statusCode:400});

        })
        }else{
            return res.status(400).send({message:"error in complaint assignment",status:false,statusCode:400});
        }
    }catch(err){
            return res.status(400).send({message:"error in complaint assignment",status:false,statusCode:400});
       
    }
}


export const shutDownRequestController = async (req, res) => {
    try{
        const {complain_no,start_time,end_time} = req.body;
       // var user = await userModel.findById(gang_id);
        if(1==1){
          
        
        await complaintModel.findByIdAndUpdate(complain_no,{
            $push : {
                    shutdown : {
                    startTime : start_time,
                    endTime : end_time
                }
            }
        },{new : true}).then(result => {
            res.status(201).send({message:"shutdown request updated",status:"success",user:result});
        }).catch(err => {
            const errormsg = new Error(err.message);
            errormsg.statusCode = 400;
            next(errormsg);
        })
        }
    }catch(err){
        const errormsg = new Error(err.message);
        errormsg.statusCode = 400;
        next(errormsg);
    }
}


export const listComplaintController = async (req, res) => {
   
        const {search} = req.body;


        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);


        if (1==2) {
    
           
            try{
                const pageNumber = req.query.page || 1;
                const pageSize = req.query.pageSize || 50;
        
                complaintModel.paginate({
                    createdAt: { $gte: firstDayOfMonth, $lte: now } // Filter records for the current month
                }, { page: pageNumber, limit: pageSize }, (err, result) => {
                if (err) {
                    const error = new Error("Error occurred while fetching users list error: " + err.message);
                    error.statusCode = 500;
                    next(error);
                }
                const { docs, total, limit, page, totalPages,prevPage,nextPage    } = result;
                res.status(200).send({ complaints: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});
                });
        
            }catch(error){
                const errormsg = new Error(error.message);
                errormsg.statusCode = 500;
                next(errormsg);
        
            }

        }else{
    
        try{

            const pageNumber = req.query.page || 1;
            const pageSize = req.query.pageSize || 50;
    
            const consumerID = req.body.consumerID;
            const userID = req.body.userID;
            const complaintno = req.body.complaintno;
            const search = req.body.search;
            if ( 1==2 ){ // userID

            complaintModel.paginate({$and:[{createdBy:userID},
                {$or:[{complaintNo:{$regex:search}},{complaintStatus:{$regex:search}}]}
        ]}, { page: pageNumber, limit: pageSize }, (err, result) => {
            if (err) {
                return res.status(400).send({message:"error in fetching record",status:"failed",statusCode:400,errorMessage:err,complaints:[]});
            }else{
                const { docs, total, limit, page, totalPages,prevPage,nextPage } = result;
                return res.status(200).send({ complaints: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});

            }
            });

            }

             if (complaintno){
            await complaintModel.paginate({_id:complaintno}, { page: pageNumber, limit: pageSize }, (err, result) => {
            if (err) {
                return res.status(400).send({message:"error in fetching record",status:false,statusCode:400,errorMessage:err,complaints:[]});

            }else{
                // console.log('aaaaaa',result.docs.length);
                if(result.docs.length == 0){
                    return res.status(200).send({ status:true,statusCode:200,message:"No record found",complaints: []});
                }else{
                    const { docs } = result;
                   /* const hostname = window.location.hostname; 
                    console.log("hostname",hostname);   
                    var siteDocs = docs.siteDocuments;    
                    siteDocs.forEach((siteDoc) =>{
                        siteDoc.forEach((doc) => {
                            doc.url = hostname+'/'+doc.documentName;
                        })
                    })

                    */
                    
                    return res.status(200).send({ status:true,statusCode:200,complaints: docs});

                }

            }
            });

            }

            if (1==2){ // consumerID
            complaintModel.paginate({$and:[{"consumerDetail.mobileNo":consumerID},
                {$or:[{complaintNo:{$regex:req.body.search}},{complaintStatus:{$regex:req.body.search}}]}
        ]}, { page: pageNumber, limit: pageSize }, (err, result) => {
            if (err) {
                return res.status(400).send({message:"error in fetching record",status:"failed",statusCode:400,errorMessage:err,complaints:[]});

            }else{
            const { docs, total, limit, page, totalPages,prevPage,nextPage } = result;
            return res.status(200).send({ complaints: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});

            }
            });

            }

                if (1==2){
                try{
                const pageNumber = req.query.page || 1;
                const pageSize = req.query.pageSize || 50;
        
                complaintModel.paginate({
                    createdAt: { $gte: firstDayOfMonth, $lte: now } // Filter records for the current month
                }, { page: pageNumber, limit: pageSize }, (err, result) => {
                if (err) {
                    return res.status(400).send({message:"error in fetching record",status:"failed",statusCode:400,errorMessage:err,complaints:[]});
                }else{

                const { docs, total, limit, page, totalPages,prevPage,nextPage    } = result;
                return res.status(200).send({ complaints: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});
                   
                }
                });
        
            }catch(error){
                    return res.status(400).send({message:"error in fetching record",status:"failed",statusCode:400,errorMessage:error,complaints:[]});
        
            }

            }

          /*  complaintModel.paginate(
                {$or:[{firstname:{$regex:req.body.search}},{lastname:{$regex:req.body.search}},{email:{$regex:req.body.search}},{phone:{$regex:req.body.search}}

                ]},
                 { page: pageNumber, limit: pageSize }, (err, result) => {
            if (err) {
                const error = new Error("Error occurred while fetching users list error: " + err.message);
                error.statusCode = 500;
                next(error);
            }
            const { docs, total, limit, page, totalPages,prevPage,nextPage    } = result;
            res.status(200).send({ complaints: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});
            });
    
            */
        
    
        }catch(error){
            res.status(500).send({message:"error in fetching record",status:false,statusCode:500,errorMessage:err,complaints:[]});

        }
    }

}

export const listComplaintCurrentMonthController = async (req, res) =>{
    try {
        // Get the current date
        const now = new Date();
        // Get the first day of the current month
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const {_id} = req.encodedUser;

        const loginPerson = await userModel.findById(_id);
        var substationID = loginPerson.substation_id

        // console.log(_id);
        // Perform the aggregation
        const results = await complaintModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: firstDayOfMonth, $lte: now },
                    substation_id:substationID // Filter records for the current month
                }
            },
            {
                $group: {
                    _id: '$complaintStatus', // Group by complaintStatus
                    count: { $sum: 1 },
                    record: {$push:"$$ROOT" }  // Return the complaintStatus field
                }
            },
            {
                $project: {
                    _id: 0,
                    complaintStatus: '$_id',
                    count: 1,
                    record:1
                }
            }
        ]);
        if(results.length == 0){
             return res.status(200).send( {statusCode:200,status:true,message:"no record found",complaints:[]});
        }else{
            return res.status(200).send( {statusCode:200,status:true,complaints:results});
        }
       
    }catch(err) {
        return res.status(400).send( {statusCode:400,status:false,error:err,complaints:[]});
    }
}


export const listComplaintCurrentMonthMobileController = async (req, res) =>{
    try {
        
        // Get the current date
        const now = new Date();
        
        // Get the first day of the current month
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const {_id} = req.encodedUser;
        
        const loginPerson = await userModel.findById(_id);
        var substationID = loginPerson.substation_id
        
        // console.log(_id);
        // Perform the aggregation
        // let openCount = 0;
        let openComplaint = (await complaintModel.find({createdAt: { $gte: firstDayOfMonth, $lte: now },complaintStatus:"Open",substation_id:substationID})).length;
        let assignedComplaint = (await complaintModel.find({createdAt: { $gte: firstDayOfMonth, $lte: now },complaintStatus:"Assigned",substation_id:substationID})).length;
        let inProgressComplaint = (await complaintModel.find({createdAt: { $gte: firstDayOfMonth, $lte: now },complaintStatus:"InProgress",substation_id:substationID})).length;
        let closedComplaint = (await complaintModel.find({createdAt: { $gte: firstDayOfMonth, $lte: now },complaintStatus:"Closed",substation_id:substationID})).length;
        let onHoldComplaint = (await complaintModel.find({createdAt: { $gte: firstDayOfMonth, $lte: now },complaintStatus:"OnHold",substation_id:substationID})).length;
        let approvedComplaint = (await complaintModel.find({createdAt: { $gte: firstDayOfMonth, $lte: now },complaintStatus:"Approved",substation_id:substationID})).length;
        let rejectedComplaint = (await complaintModel.find({createdAt: { $gte: firstDayOfMonth, $lte: now },complaintStatus:"Rejected",substation_id:substationID})).length;
        let shutdownComplaint = (await complaintModel.find({createdAt: { $gte: firstDayOfMonth, $lte: now },complaintStatus:"Shutdown",substation_id:substationID})).length;
        let pendingComplaint = (await complaintModel.find({createdAt: { $gte: firstDayOfMonth, $lte: now },complaintStatus:"Pending",substation_id:substationID})).length;
        var counts= {};
        // if(openComplaint){
        //     openCount = openComplaint;
        // }
        counts.Open = openComplaint;
        counts.Assigned = assignedComplaint;
        counts.InProgress = inProgressComplaint;
        counts.Closed = closedComplaint;
        counts.Hold = onHoldComplaint;
        counts.Approved = approvedComplaint;
        counts.Rejected = rejectedComplaint;
        counts.Shutdown = shutdownComplaint;
        counts.Pending = pendingComplaint;
        // counts.Open = shutdownComplaint;

        let mobileDashboardRecord = (await complaintModel.find(
                {
                   createdAt: { $gte: firstDayOfMonth, $lte: now },
                    substation_id:substationID 
                }

        ).select('_id complaintNo consumerAddress shutdown complaintStatus consumerName consumerMobile consumerAccountNo registrationDate'));

        if(mobileDashboardRecord){
        return res.status(200).send( {statusCode:200,status:true,counts:counts, complaints:mobileDashboardRecord});
        }else{
            return res.status(400).send( {statusCode:400,status:false,counts:counts,message:"No record found", complaints:[]});
        }

       
       
    }catch(err) {
        return res.status(400).send( {statusCode:400,status:false,error:err,complaints:[]});
    }
}


export const webDashboardController = async (req, res) => {



try {
    const getSixMonthsAgo = (date) => {
        let sixMonthsAgo = new Date(date);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return sixMonthsAgo;
    }

    function getOneYearAgo(date) {
        let oneYearAgo = new Date(date);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return oneYearAgo;
    }

    const {_id} = req.encodedUser;
    const loginPerson = await userModel.findById(_id);
    var substationID = loginPerson.substation_id;

    if (req.body.durarion == 'all') {
        let openComplaint = (await complaintModel.find({complaintStatus: "Open", substation_id: substationID})).length;
        let assignedComplaint = (await complaintModel.find({complaintStatus: "Assigned", substation_id: substationID})).length;
        let inProgressComplaint = (await complaintModel.find({complaintStatus: "InProgress", substation_id: substationID})).length;
        let closedComplaint = (await complaintModel.find({complaintStatus: "Closed", substation_id: substationID})).length;
        let onHoldComplaint = (await complaintModel.find({complaintStatus: "OnHold", substation_id: substationID})).length;
        let approvedComplaint = (await complaintModel.find({complaintStatus: "Approved", substation_id: substationID})).length;
        let rejectedComplaint = (await complaintModel.find({complaintStatus: "Rejected", substation_id: substationID})).length;
        let shutdownComplaint = (await complaintModel.find({complaintStatus: "Shutdown", substation_id: substationID})).length;
        let pendingComplaint = (await complaintModel.find({complaintStatus: "Pending", substation_id: substationID})).length;

        var counts = {};
        counts.Open = openComplaint;
        counts.Assigned = assignedComplaint;
        counts.InProgress = inProgressComplaint;
        counts.Closed = closedComplaint;
        counts.Hold = onHoldComplaint;
        counts.Approved = approvedComplaint;
        counts.Rejected = rejectedComplaint;
        counts.Shutdown = shutdownComplaint;
        counts.Pending = pendingComplaint;

        console.log(counts);

        await complaintModel.paginate({
            substation_id:substationID// Filter records for the current month
        }, { page: pageNumber, limit: pageSize }, (err, result) => {
        if (err) {
        return res.status(200).send({message:"no record found",status:false,statusCode:200,errorMessage:err,complaints:[]});
        }else{
        const { counts:counts, docs, totalDocs, limit, page, totalPages,prevPage,nextPage} = result;
        return res.status(200).send({ status:true,statusCode:200,complaints: docs, Total:totalDocs, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});
        }
        });


       /* let mobileDashboardRecord = await complaintModel.find({
            substation_id: substationID
        }).select('_id complaintNo consumerAddress shutdown complaintStatus consumerName consumerMobile consumerAccountNo registrationDate');

        if (mobileDashboardRecord) {
            return res.status(200).send({statusCode: 200, status: true, counts: counts, complaints: mobileDashboardRecord});
        } else {
            return res.status(400).send({statusCode: 400, status: false, counts: counts, message: "No record found", complaints: []});
        } */

    } else {
        const now = new Date();
        let firstDayOfMonth;

        if (req.body.durarion == 'sixMonth') {
            firstDayOfMonth = getSixMonthsAgo(now);
        } else if (req.body.durarion == 'oneYear') {
            firstDayOfMonth = getOneYearAgo(now);
        } else if (req.body.durarion == 'currentMont') {
            firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        //  console.log("firstDayOfMonth9090",firstDayOfMonth);

        let openComplaint = (await complaintModel.find({
            createdAt: { $gte: firstDayOfMonth, $lte: now },
            complaintStatus: "Open",
            substation_id: substationID
        })).length;
        let assignedComplaint = (await complaintModel.find({
            createdAt: { $gte: firstDayOfMonth, $lte: now },
            complaintStatus: "Assigned",
            substation_id: substationID
        })).length;
        let inProgressComplaint = (await complaintModel.find({
            createdAt: { $gte: firstDayOfMonth, $lte: now },
            complaintStatus: "InProgress",
            substation_id: substationID
        })).length;
        let closedComplaint = (await complaintModel.find({
            createdAt: { $gte: firstDayOfMonth, $lte: now },
            complaintStatus: "Closed",
            substation_id: substationID
        })).length;
        let onHoldComplaint = (await complaintModel.find({
            createdAt: { $gte: firstDayOfMonth, $lte: now },
            complaintStatus: "OnHold",
            substation_id: substationID
        })).length;
        let approvedComplaint = (await complaintModel.find({
            createdAt: { $gte: firstDayOfMonth, $lte: now },
            complaintStatus: "Approved",
            substation_id: substationID
        })).length;
        let rejectedComplaint = (await complaintModel.find({
            createdAt: { $gte: firstDayOfMonth, $lte: now },
            complaintStatus: "Rejected",
            substation_id: substationID
        })).length;
        let shutdownComplaint = (await complaintModel.find({
            createdAt: { $gte: firstDayOfMonth, $lte: now },
            complaintStatus: "Shutdown",
            substation_id: substationID
        })).length;
        let pendingComplaint = (await complaintModel.find({
            createdAt: { $gte: firstDayOfMonth, $lte: now },
            complaintStatus: "Pending",
            substation_id: substationID
        })).length;

        var counts = {};
        counts.Open = openComplaint;
        counts.Assigned = assignedComplaint;
        counts.InProgress = inProgressComplaint;
        counts.Closed = closedComplaint;
        counts.Hold = onHoldComplaint;
        counts.Approved = approvedComplaint;
        counts.Rejected = rejectedComplaint;
        counts.Shutdown = shutdownComplaint;
        counts.Pending = pendingComplaint;

        let mobileDashboardRecord = await complaintModel.find({
            createdAt: { $gte: firstDayOfMonth, $lte: now },
            substation_id: substationID
        }).select('_id complaintNo consumerAddress shutdown complaintStatus consumerName consumerMobile consumerAccountNo registrationDate');

        if (mobileDashboardRecord) {
            return res.status(200).send({statusCode: 200, status: true, counts: counts, complaints: mobileDashboardRecord});
        } else {
            return res.status(400).send({statusCode: 400, status: false, counts: counts, message: "No record found", complaints: []});
        }
    }
} catch (err) {
    return res.status(400).send({statusCode: 400, status: false, error: err, complaints: []});
}

}

export const addSitePhotoController = async (req, res) => {


    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            if(file.mimetype === 'image/jpeg' 
            || file.mimetype === 'image/png'){
                cb(null,path.join(__dirname,'./uploads'));
            }
            else{
                cb(null,path.join(__dirname,'./uploads'));
            }
        },
        filename: function (req, file, cb) {
          // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          cb(null, file.originalname)
        }
      })
      
    
       const fileFilter = (req,file,cb) => {
        if (file.fieldname === "avatar") {
            (file.mimetype === 'image/jpeg' 
             || file.mimetype === 'image/png')
            ? cb(null,true)
            : cb(null,false);
        }
        else if(file.fieldname === "document"){
            (file.mimetype === 'application/msword' 
            || file.mimetype === 'application/pdf' || file.mimetype === 'application/csv' || file.mimetype === 'text/csv' || file.mimetype  === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            ? cb(null,true)
            : cb(null,false);
        }
    } 
    
    
      const upload = multer({ storage: storage,fileFilter:fileFilter})

      upload.single('avatar');

    return res.status(200).send('file uploadedssss.');
    /* try{

        
        if (!req.files.avatar) {
            return res.status(400).send('No file uploaded.');
        }

     


        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        } 
        
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                if(file.mimetype === 'image/jpeg' 
                || file.mimetype === 'image/png'){
                    cb(null,path.join(__dirname,'./uploads'));
                }
                else{
                    cb(null,path.join(__dirname,'./uploads'));
                }
            },
            filename: function (req, file, cb) {
              // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
              cb(null, file.originalname)
            }
          })
          
        
           const fileFilter = (req,file,cb) => {
            if (file.fieldname === "avatar") {
                (file.mimetype === 'image/jpeg' 
                 || file.mimetype === 'image/png')
                ? cb(null,true)
                : cb(null,false);
            }
            else if(file.fieldname === "document"){
                (file.mimetype === 'application/msword' 
                || file.mimetype === 'application/pdf' || file.mimetype === 'application/csv' || file.mimetype === 'text/csv' || file.mimetype  === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                ? cb(null,true)
                : cb(null,false);
            }
        } 


        const upload = multer({ storage: storage,fileFilter:fileFilter})
        upload.single('avatar')
        
        const filePath = req.file.path;
        const fileName = req.file.filename;

        res.send({ path:filePath, name:fileName });

        await complaintModel.findByIdAndUpdate(complain_no,{
            $push : {
                siteDocuments : {
                    documentName : file.filename,
                    uploadDate : new Date(),
                    documentURL : '1',
                }
            }
        });
        res.status(200).send({message:"photo added updated"});
    }catch(err){
        res.status(500).send({messagedddd:err});
    } */
}


  

export const getDataFromConsumer = async (req, res) => {

   try{
    const authHeader = req.headers['authorization'];
   if (!authHeader || !authHeader.startsWith('Basic ')) {
       return res.status(401).send({ message: 'Missing or invalid authorization header', statusCode: 401,status:false,complaint:[] });
   } 
 
   // Decode the Basic Auth cr edentials
   const base64Credentials = authHeader.split(' ')[1];  
   const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
   const [username, password] = credentials.split(':');
   if (!username || !password) {
       return res.status(400).send({ message: 'Username and password are required',statusCode: 400,status:false,complaint:[] });
   }


   const storedConsumer = await complaintAgencyModel.findOne({ username:username });
          // console.log("storedConsumer",storedConsumer);

   if (!storedConsumer) {
       return res.status(404).send({ message: 'complaint agency not found', statusCode: 404,status:false,complaint:[] });
   }


    if(password != storedConsumer.password){
        return res.status(401).send({ message: 'Invalid credentials',statusCode: 401,status:false,complaint:[] });
    }
//    // Compare the hashed password
//    const passwordMatch = await bcrypt.compare(password, storedConsumer.password);

//    if (!passwordMatch) {
//        return res.status(401).json({ error: 'Invalid credentials' });
//    }

const  AGENCY_SOURCE =   storedConsumer._id;

    const {
        DISCOM,
        ZONE,
        CIRCLE,
        DIVISION,
        SUBDIVISION,
        SUBSTATION,
        FEEDER,
        DISTRICT,
        REGISTRATION_DATE,
        COMPLAINT_TYPE,
        COMPLAINT_SUB_TYPE,
        COMPLAINT_NO,
        CONSUMER_NAME,
        CONSUMER_MOBILE,
        CONSUMER_ADDRESS,
        CONSUMER_TYPE,
        CONSUMER_ACCOUNT_NO,
        REMARKS,
        JE_NAME,
        JE_MOBILE,
        SDO_NAME,
        SDO_MOBILE,
        XEN_NAME,
        XEN_MOBILE,
        STS,
        COMPLAINT_SOURCE,
        CREATED_BY,
        latitude,
        longitude,
        substation_id
    } = req.body;

  

    const complaintNoExists = await complaintModel.findOne({ complaintNo:COMPLAINT_NO });

    if (complaintNoExists) {
        return res.status(409).json({ message: 'Complaint already exists', statusCode: 409,status:false,complaint:[] });
    }


const complaintData = {
    discom: DISCOM,
    zone: ZONE,
    circle: CIRCLE,
    division: DIVISION,
    subdivision: SUBDIVISION,
    substation: SUBSTATION,
    feeder: FEEDER,
    district: DISTRICT,
    registrationDate: REGISTRATION_DATE,
    complaintType: COMPLAINT_TYPE,
    complaintSubType: COMPLAINT_SUB_TYPE,
    complaintNo: COMPLAINT_NO,
    consumerName: CONSUMER_NAME,
    consumerMobile: CONSUMER_MOBILE,
    consumerAddress: CONSUMER_ADDRESS,
    consumerType: CONSUMER_TYPE,
    consumerAccountNo: CONSUMER_ACCOUNT_NO,
    remarks: REMARKS,
    jeName: JE_NAME,
    jeMobile: JE_MOBILE,
    SDOName: SDO_NAME,
    SDOMobile: SDO_MOBILE,
    XENName: XEN_NAME,
    XENMobile: XEN_MOBILE,
    sts: STS,
    complaintSource: COMPLAINT_SOURCE,
    createdBy:CREATED_BY,
    agencySource: '6644523fc520fd23960dc1d7',
    latitude:latitude,
    longitude:longitude,
    substation_id:substation_id
    
};  
  // console.log('bbbb',complaintData);

    const complaint = await new complaintModel(
      complaintData
    ).save();
     return res.status(201).send({message:"complaint created successfully",status:true,statusCode:201,complaint:complaint});
    }catch(err) {
        return res.status(500).send({message:"error in complaint creation",statusCode:500,status:false,err:err,complaint:[]});
        
    }
};







export const autoAssign = async (req, res) => {

    try {
        const complains = await complaintModel.find({  complaintStatus: "Open" }).select('latitude longitude complaintNo _id');
        const gangLocations = await gangModel.find({}).select('latitude longitude gangMobile substation gangName _id');
      

        /* const gangLocations = [
            { id: "Aminabad LKO", latitude: 26.8540, longitude: 80.9357 },
            { id: "Alambagh LKO", latitude: 26.7947, longitude: 80.9102 },
            { id: "Gomti Nagar LKO", latitude: 26.852, longitude: 81.0236 },


            { id: "Mall Road CNB", latitude: 26.4776, longitude: 80.3209 },
            { id: "Swaroop Nagar CNB", latitude: 26.4865, longitude: 80.3005 },
            { id: "Panki CNB", latitude: 26.4652, longitude: 80.2191 },
          ]; */


          // Function to find the nearest gang
            const findNearestGang = (complaint, gangs) => {
                let nearestGang = null;
                let shortestDistance = Infinity;
            
                gangs.forEach(gang => {
                const distance = haversine(complaint, gang);
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestGang = gang;
                }
                });
            
                return nearestGang;
            };


            // Function to find nearest gangs for all complaints
            const findNearestGangsForComplaints = async (complaints, gangs) => {
                return complaints.map(complaint => ({
                complaint,
                nearestGang: findNearestGang(complaint, gangs)
                }));
            };
            
            ///console.log('aaaaaaa',complains, gangLocations);
  // Find the nearest gangs for all complaint locations
            const nearestGangs = await findNearestGangsForComplaints(complains, gangLocations);
            //console.log('aaaaaaa nearestGangs',nearestGangs);
  
            nearestGangs.forEach(async ({ complaint, nearestGang }) => {
            //console.log(`Complaint No ${complaint.complaintNo}: Complaint at (${complaint.latitude}, ${complaint.longitude}) - Nearest Gang:`, nearestGang);
    
   // assing gang to complaint

        // var user = await gangModel.findById(nearestGang._id);
        if(1==1){
            // console.log(user.firstname);
        console.log('bbbbbb',complaint.complaintNo,nearestGang._id,nearestGang.gangName);
       await complaintModel.findByIdAndUpdate(complaint._id,{
            $set : {
                gangDetail : {
                    gangId :  nearestGang._id,
                    gangName : nearestGang.gangName,
                    gangMobileNo : nearestGang.gangMobile,
                    gangSubstation : nearestGang.substation
                },
                
                   complaintStatus:"Assigned" 
                
            }
        },{new : true}).then(result => {
            return res.status(201).send({message:"complaint assigned successfully",status:true,statusCode:201,user:result});
        }).catch(err => {
             return res.status(201).send({message:"Gang not found!",status:false,statusCode:201,user:[]});
        })
        }else{
            return res.status(201).send({message:"Gang not found!",status:false,statusCode:201,user:[]});
        }
   


});



         return res.status(200).json({ message: 'Complaints Assigned successfully.', statusCode: 200,status: true });
    } catch (error) {
        console.error("Error updating complaints:", error);
        return res.status(400).json({ message: 'Internal server error.', statusCode: 400,status: false});
    }
};
