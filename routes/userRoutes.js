import express from "express";
import { registerController,loginController,userListController,updateUserController,searchController,getOTPController,mobileLoginController,logoutController } from "../controllers/userController.js";
import { isAuth } from "../middleware/isAuth.js";
import { addComplaintController,addStaffRemarksController,addSelfRemarksController,assignComplainController,shutDownRequestController, listComplaintController,listComplaintCurrentMonthController,updateComplaintStatusController,updateComplaintController,getDataFromConsumer,autoAssign } from "../controllers/complaintController.js";
import formidable from 'express-formidable';
import complaintModel from "../models/complaintModel.js";

import multer from 'multer';
import path from 'path';
import { addGangController, addMembersMultipleController, addMembersSingleController,editGangController,removeMembersController,gangListController } from "../controllers/gangController.js";
const __dirname = path.resolve(path.dirname('')); 
// const upload = multer({ dest: 'uploads/' });


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
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, Date.now()+file.originalname)
    }
  })
  

   const fileFilter = (req,file,cb) => {
    cb(null,true);
    /* if (file.fieldname === "avatar") {
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
    } */
} 


  const upload = multer({ storage: storage,fileFilter:fileFilter})






const router = express.Router();

router.post("/register", registerController);
router.post("/web-login", loginController);
router.post("/get-otp", getOTPController);
router.post("/mobile-login", mobileLoginController);
router.post("/logout", isAuth, logoutController);


router.get("/user-list", isAuth, userListController);
router.put("/user-update", isAuth, updateUserController);
router.post("/user-search", isAuth,  searchController);


router.post("/get-complaint-from-consumer", getDataFromConsumer);

router.post("/add-complaint", isAuth,  addComplaintController);
router.put("/update-complaint", upload.single('avatar'),  updateComplaintController);
router.put("/add-staff-remarks", isAuth,   addStaffRemarksController);
router.put("/add-self-remarks", isAuth,  addSelfRemarksController);
router.put("/assign-complain",    assignComplainController);
router.put("/shutdown-request",  shutDownRequestController);
router.post("/list-complaints", isAuth, listComplaintController);
router.post("/get-current-month-complaints", isAuth,  listComplaintCurrentMonthController);
router.put("/complaint-status",  isAuth, updateComplaintStatusController);
router.post("/auto-assign-complaint",  autoAssign);



router.post("/add-gang", isAuth,   addGangController);
router.put("/edit-gang", isAuth,   editGangController);
router.put("/add-members", isAuth,   addMembersSingleController);
router.put("/remove-members", isAuth,   removeMembersController);
router.put("/add-members-multiple", isAuth,   addMembersMultipleController);
router.post("/list-gang", isAuth,   gangListController);



router.put("/add-sitephoto/:cid",upload.single('avatar'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    
    const complain_no = req.params.cid;
    const filePath = req.file.path;
    const fileName = req.file.filename;
    console.log(req.body.field1);
    await complaintModel.findByIdAndUpdate(complain_no,{
        $push : {
            siteDocuments : {
                documentName : fileName,
                uploadDate : new Date(),
                documentURL : filePath,
            }
        }
    });
    res.status(200).send({message:"photo added updated",filePath:filePath,fileName:fileName});



    });


export default router;