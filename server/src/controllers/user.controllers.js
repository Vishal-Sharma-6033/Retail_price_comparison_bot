import mongoose from "mongoose";
import {User} from "../models/user.models.js";



const getUserProfile = async (req, res) => {
  res.json({ user: req.user });
};

const getWastchList = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("watchList");
    res.json({ watchList: user.watchList || [], message: "Watchlist retrieved successfully" });
  } catch (error) {
    return next(error);
  }
};

const addToWatchList = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchList: productId }
    });

    return res
    .status(200).json({ message: "Product added to watchlist successfully" });
  } catch (error) {
    return next(error);
  }
};

const removeFromWatchList = async (req, res, next) => {
    try {
    const { productId } = req.params;
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { watchList: productId }
    });

    return res.status(200).json({ message: "Product removed from watchlist successfully" });
  } catch (error) {
    return next(error);
  }
};

export { getUserProfile, getWastchList, addToWatchList, removeFromWatchList };
