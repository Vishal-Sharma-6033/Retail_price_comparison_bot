import mongoose,{Schema} from "mongoose";

const userSchema = new Schema(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
        },
        passwordHash:{
            type:String,
            required:true
        },
        role:{
            type:String,
            enum:["customer", "shopkeeper", "admin"],
            default:"customer"
        },
        watchList:[{
            type:Schema.Types.ObjectId,
            ref:"Product"
        }]

    }, {timestamps:true,strict:false});

export const User = mongoose.model("User",userSchema);