import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
     role: {
        type: String,
        required: true,
        enum: ['JEE', 'SSO', 'GANG', 'ADMIN'],
        default: 'GANG'
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
    },
    adharID:{
        type: String,
    },
    EPSICNumber:{
        type: String,
    },
    ITICertificateNumber:{
        type: String,
    },
    otp: {
    token: {
        type: String,
    },
    expiry_time: {
        type: String,
    }
  }

},{
    timestamps: true
});
userSchema.plugin(mongoosePaginate);

export default mongoose.model('users', userSchema);
