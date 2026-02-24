import jwt from 'jsonwebtoken';
import {User} from '../models/user.models.js';

const authenticateToken = async(req,res,next)=>{
      const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if(!token){
    return res.status(401).json({message:"Unauthorized: No token provided"});

  }

  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);

  if(!decoded || !decoded.sub){
    return res.status(401).json({message:"Unauthorized: Invalid token"});
  }
  const user= await User.findById(decoded.sub).select("-passwordHash");

  if(!user){
    return res.status(401).json({message:"Unauthorized: User not found"});
  }

  req.user=user;
  next();
  } catch (error) {
    return res.status(401).json({message:"Unauthorized: Invalid token"});
    
  }

}

export {authenticateToken};