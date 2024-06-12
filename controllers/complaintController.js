import complaintModel from "../models/complaintModel.js";
import {format} from 'date-fns';
import userModel from "../models/userModel.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import complaintAgencyModel from "../models/complaintAgencyModel.js";
import gangModel from "../models/gangModel.js";
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
        const {complaintID,complaintStatus,staff_remark,self_remark,assign_to,shutdown_start_time,shutdown_end_time} = req.body;
        if (!complaintID) {
            res.status(400).send({message:"All fields are required",status:"failed",statusCode:400,complaint:[]});
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
                        remarkBy : '1',
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
                        remarkBy : '1',
                    }
                }
                });
            }
            if (assign_to){
                
                 var gang = await gangModel.findById(assign_to);
                 console.log(gang);   

                if(gang){
        
                await complaintModel.findByIdAndUpdate(complaintID,{
                $set : {
                gangDetail : {
                    gangId :  gang._id,
                    gangName : gang.gangName,
                    gangMobileNo : gang.gangMobile,
                    gangSubstation : gang.substation
                }}});
                }
            }
            if (shutdown_start_time != '' && shutdown_end_time != ''){

                // var user = await userModel.findById(requested_by);

                if(1==1){
                     await complaintModel.findByIdAndUpdate(complaintID,{
                    $push : {
                            shutdown : {
                            startTime : shutdown_start_time,
                            endTime : shutdown_end_time
                        }
                    }});
                }
            }

            if (req.file) {
        
                const filePath = req.file.path;
                const fileName = req.file.filename;
            
                await complaintModel.findByIdAndUpdate(complaintID,{
                    $push : {
                        siteDocuments : {
                            documentName : fileName,
                            uploadDate : new Date(),
                            documentURL : filePath,
                        }
                    }
                });


            }
            
            const complaintData = await complaintModel.findById(complaintID);
            res.status(201).send({message:"complaint updated successfully",status:"success",statusCode:201,complaint:complaintData});
           
        }
        catch(err) {
        res.status(500).send({message:"error occured in complaint status updation",status:"failed",statusCode:500,errorMessage:err,complaint:[]});
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

        var user = await userModel.findById(gang_id);
        if(user){
            // console.log(user.firstname);
        
       await complaintModel.findByIdAndUpdate(complain_no,{
            $set : {
                gangDetail : {
                    gangId :  user._id,
                    gangName : user.name,
                    gangMobileNo : user.phone,
                    gangSubstation : 'gangSubstation',
                }
            }
        },{new : true}).then(result => {
            res.status(201).send({message:"complaint assigned successfully",status:"success",user:result});
        }).catch(err => {
            const errormsg = new Error(err.message);
            errormsg.statusCode = 400;
            next(errormsg);
        })
        }else{
            res.status(201).send({message:"Gang not found!",status:"error",user:[]});
        }
    }catch(err){
        const errormsg = new Error(err.message);
        errormsg.statusCode = 400;
       
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


export const listComplaintController = (req, res) => {
   
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
            if (userID){

            complaintModel.paginate({$and:[{createdBy:userID},
                {$or:[{complaintNo:{$regex:search}},{complaintStatus:{$regex:search}}]}
        ]}, { page: pageNumber, limit: pageSize }, (err, result) => {
            if (err) {
                res.status(400).send({message:"error in fetching record",status:"failed",statusCode:400,errorMessage:err,complaints:[]});
            }else{
                const { docs, total, limit, page, totalPages,prevPage,nextPage } = result;
                res.status(200).send({ complaints: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});

            }
            });

            }

             if (complaintno){
            complaintModel.paginate({_id:complaintno}, { page: pageNumber, limit: pageSize }, (err, result) => {
            if (err) {
                res.status(400).send({message:"error in fetching record",status:"failed",statusCode:400,errorMessage:err,complaints:[]});

            }else{
            const { docs, total, limit, page, totalPages,prevPage,nextPage } = result;
            res.status(200).send({ complaints: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});

            }
            });

            }

            if (consumerID){
            complaintModel.paginate({$and:[{"consumerDetail.mobileNo":consumerID},
                {$or:[{complaintNo:{$regex:req.body.search}},{complaintStatus:{$regex:req.body.search}}]}
        ]}, { page: pageNumber, limit: pageSize }, (err, result) => {
            if (err) {
                res.status(400).send({message:"error in fetching record",status:"failed",statusCode:400,errorMessage:err,complaints:[]});

            }else{
            const { docs, total, limit, page, totalPages,prevPage,nextPage } = result;
            res.status(200).send({ complaints: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});

            }
            });

            }


                try{
                const pageNumber = req.query.page || 1;
                const pageSize = req.query.pageSize || 50;
        
                complaintModel.paginate({
                    createdAt: { $gte: firstDayOfMonth, $lte: now } // Filter records for the current month
                }, { page: pageNumber, limit: pageSize }, (err, result) => {
                if (err) {
                    res.status(400).send({message:"error in fetching record",status:"failed",statusCode:400,errorMessage:err,complaints:[]});
                }else{

                const { docs, total, limit, page, totalPages,prevPage,nextPage    } = result;
                res.status(200).send({ complaints: docs, Total:total, Limit:limit, Page:page, pages:totalPages,prevPage:prevPage, nextPage:nextPage});
                   
                }
                });
        
            }catch(error){
                const errormsg = new Error(error.message);
                errormsg.statusCode = 500;
                next(errormsg);
        
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
            res.status(500).send({message:"error in fetching record",status:"failed",statusCode:500,errorMessage:err,complaints:[]});

        }
    }

}

export const listComplaintCurrentMonthController = async (req, res) =>{
    try {
        // Get the current date
        const now = new Date();
        // Get the first day of the current month
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Perform the aggregation
        const results = await complaintModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: firstDayOfMonth, $lte: now } // Filter records for the current month
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
        res.status(200).send( {complaints:results});
    }catch(err) {
        res.status(400).send( {error:err});
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
       return res.status(401).json({ message: 'Missing or invalid authorization header', status: 401 });
   } 
 
   // Decode the Basic Auth cr edentials
   const base64Credentials = authHeader.split(' ')[1];  
   const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
   const [username, password] = credentials.split(':');
   if (!username || !password) {
       return res.status(400).json({ message: 'Username and password are required',status: 400 });
   }


   const storedConsumer = await complaintAgencyModel.findOne({ username:username });
          // console.log("storedConsumer",storedConsumer);

   if (!storedConsumer) {
       return res.status(404).json({ message: 'complaint agency not found', status: 404 });
   }


    if(password != storedConsumer.password){
        return res.status(401).json({ message: 'Invalid credentials',status: 401 });
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
        // AGENCY_SOURCE
    } = req.body;

   

    const complaintNoExists = await complaintModel.findOne({ complaintNo:COMPLAINT_NO });

    if (complaintNoExists) {
        return res.status(409).json({ message: 'Complaint already exists', status: 409 });
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
    agencySource: '6644523fc520fd23960dc1d7'
};

  //  console.log('bbbb',complaintData);

    const user = await new complaintModel(
      complaintData
    ).save();
     res.status(201).send({message:"complaint created successfully",status:"success"});
    }catch(err) {
         res.status(500).send({message:"error in complaint creation",statusCode:500,status:"false",err:err});
        
    }
};

