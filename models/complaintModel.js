import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

function setDatePart(date) {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

const complaintSchema = new mongoose.Schema({
    
      discom: {
        type: String,
      },  
      zone: {
        type: String,
      },   
      circle: {
        type: String,
      }, 
      division: {
        type: String,
      },
      subdivision: {
        type: String,
      },
      substation: {
        type: String,
      },
      feeder: {
        type: String,
      },
      district: {
        type: String,
      },
      district: {
        type: String,
      },
      registrationDate: {
        type: Date,
        default: Date
      },
      complaintType: {
        type: String,
      },
      complaintSubType: {
        type: String,
      },
      complaintNo: {
        type: String,
      },
      consumerName: {
        type: String,
      },
      consumerMobile: {
        type: String,
      },
      consumerAddress: {
        type: String,
      },
       consumerType: {
        type: String,
      },
      consumerAccountNo: {
        type: String,
      },
       remarks: {
        type: String,
      },
       JEName: {
        type: String,
      },
       JEMobile: {
        type: String,
      },
      SDOName: {
        type: String,
      },
       SDOMobile: {
        type: String,
      },
      XENName: {
        type: String,
      },
       XENMobile: {
        type: String,
      },
       sts: {
        type: String,
      },
      complaintSource: {
        type: String,
      },
      AgencySource: {
         type: String,
      },
      createdBy: {
          type: String,
        },  
      gangDetail: {
        gangName: String,
        gangId: String,
        gangMobileNo: String,
        gangDistrict: String,
        gangSubstation: String,
        // Add any other relevant fields for gang details
      },
       substation_id:{
           type: mongoose.ObjectId,
            ref: "substation",
        },
        latitude: {
          type: String,
        },
        longitude: {
          type: String,
        },
      complaintStatus: {
        type: String,
        required: true,
        enum: ['Open','Assigned', 'In Progress', 'Closed', 'On Hold','Approved', 'Rejected', 'Shutdown','Pending'],
        default: 'Open'
      },
     
      staffRemarks: [{
        remark: String,
        date: Date,
        remarkBy: String,
        // Add any other relevant fields for staff remarks
      }],
      selfRemarks: [{
        remark: String,
        date: Date,
        remarkBy: String,
        // Add any other relevant fields for self-remarks
      }],
      siteDocuments: [{
        documentName: String,
        documentURL: String,
        uploadDate: Date,
        // Add any other relevant fields for site documents
      }],
      shutdown: [{
        startTime: Date,
        endTime: Date,
        // Add any other relevant fields for shutdown
      }]
     

},{
    timestamps: true
});
complaintSchema.plugin(mongoosePaginate);

export default mongoose.model('complaints', complaintSchema);
