import User from '../models/user.model.js';
import { errorHandler } from '../lib/utils/errorHandler.js';

export const getUserProfile = async (req, res, next) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return next(errorHandler(400, 'User not found'));
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(`Error in getUserProfile ${err.message}`);
    next(err);
  }
};
