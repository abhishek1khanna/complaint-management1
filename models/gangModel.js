import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

function setDatePart(date) {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

const gangSchema = new mongoose.Schema({
    
        gangLeaderID: {
          type: mongoose.ObjectId,
          ref: "users",
        },
        gangLeaderName:{
            type: String,
        },
        createdBy: {
          type: mongoose.ObjectId,
          ref: "users",
          required: true,
        },   
        gangName:{
            type: String,
        },
        gangMobile:{
            type: String,
        },
        tools_availabe: {
        type: String,
        },
      
        location: {
          type: String,
        },
      
        substation: {
          type: String,
        },
        feeder: {
          type: String,
        },
     
        members: [{
          memberIDIs:String,
          name: String,
          phone: String,
          adharID: String,
          EPSICNumber: String,
          ITICertificateNumber: String
        }],
        security_equipment: [{
          item: String,
          quantity: String,
        }]

},{
    timestamps: true
});
gangSchema.plugin(mongoosePaginate);

export default mongoose.model('gangs', gangSchema);
