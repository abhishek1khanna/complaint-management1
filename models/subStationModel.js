import mongoose from "mongoose";

const getConsumerData = new mongoose.Schema({
  subdivisionID: {
    type: Number,
    required: true,
  },
  subdivision: {
    type: String,
    required: true,
  },
  sub_station: {
    type: String,
    required: true,
  },
});

export default mongoose.model("substation", getConsumerData);
