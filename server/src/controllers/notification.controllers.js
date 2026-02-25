import {Notification} from "../models/notifications.models.js";

const listNotifications=async(req, res, next)=>{
     try {
        console.log("REQ USER:", req.user);
        const notifications= await Notification.find({user:req.user._id})
        .sort({createdAt:-1})
        .populate("product")
        .populate("shop")
        .limit(50)
        return res.json({notifications})
     } catch (error) {
        return next(error);
     }
}

const markRead=async(req, res, next)=>{
 const {id}=req.params
 if(!id){
    return res.status(400).json({message:"Notification id is required"})
 }
 try {
    const notification=await Notification.findByIdAndUpdate(id, {read:true}, {new:true})
    if(!notification){
        return res.status(404).json({message:"Notification not found"})
    }
    return res.json({notification})
 } catch (error) {
    return next(error)
 }
}

export {listNotifications, markRead}