import  mongoose from "mongoose";

const getConsumerData = new mongoose.Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true },
});

export default mongoose.model('complain_agency', getConsumerData);


