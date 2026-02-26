const User = require("../models/User");

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

const getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("watchlist");
    return res.json({ watchlist: user.watchlist || [] });
  } catch (error) {
    return next(error);
  }
};

const addToWatchlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchlist: productId }
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

const removeFromWatchlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { watchlist: productId }
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMe, getWatchlist, addToWatchlist, removeFromWatchlist };
