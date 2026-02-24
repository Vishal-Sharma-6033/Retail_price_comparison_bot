import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({},{timestamps:true,strict:false});

export const User = mongoose.model("User",userSchema);