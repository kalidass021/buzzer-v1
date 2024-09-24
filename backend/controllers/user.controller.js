import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
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

export const followUnfollowUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // target user
    const userToModify = await User.findById(id);
    // follower user
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return next(errorHandler(400, "You can't follow/unfollow yourself"));
    }

    if (!userToModify || !currentUser) {
      return next(errorHandler(400, 'User not found'));
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // unfollow the user
      // remove follower user from the target user's followers arr
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      // remove target user from the follower users following arr
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      // for unfollow we don't need to sent notification
      // Todo: return the id of the user as a response
      res.status(200).json({message: 'User unfollowed successfully'});
    } else {
      // follow the user
      // add follower user in the target user's followers arr
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      // add target user in the follwer user's following arr
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      // send the notification to user
      const newNotification = new Notification({
        type: 'follow',
        from: req.user._id,
        to: userToModify._id, // id
      });

      await newNotification.save();
      // Todo: return the id of the user as a response
      res.status(200).json({message: 'User followed successfully'});
    }
  } catch (err) {
    console.error(`Error in followUnfollowUser: ${err.message}`);
    next(err);
  }
};
