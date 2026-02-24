import {User} from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

const registerUser = async (req, res, next) => {
  try {
    
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const allowedRoles = ["customer", "shopkeeper"];
    const nextRole = allowedRoles.includes(role) ? role : "customer";
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      passwordHash,
      role: nextRole,
    });
    await newUser.save();
    const token = generateToken(newUser._id);

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser= async(req, res, next)=>{

}

export { registerUser, loginUser };
