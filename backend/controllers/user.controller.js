import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
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
      res.status(200).json({ message: 'User unfollowed successfully' });
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
      res.status(200).json({ message: 'User followed successfully' });
    }
  } catch (err) {
    console.error(`Error in followUnfollowUser: ${err.message}`);
    next(err);
  }
};

export const getSuggestedUsers = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const usersFollowedByMe = await User.findById(userId).select('following');
    // exclude the current user from the suggestedUsers arr
    // get some users excluding the current user
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    // exclude the users already followed by me
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    // suggestedUsers contains password
    // remove the password from the suggestedUsers
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (err) {
    console.error(`Error in suggestedUsers: ${err.message}`);
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;

  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    if (
      (currentPassword && !newPassword) ||
      (!currentPassword && newPassword)
    ) {
      return next(
        errorHandler(
          400,
          'Please provide both current password and new password'
        )
      );
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return next(errorHandler(400, 'Current password is incorrect'));
      }

      if (newPassword.length < 6) {
        return next(
          errorHandler(400, 'Password must be at least 6 characters long')
        );
      }

      if (newPassword === currentPassword) {
        return next(errorHandler(400, 'Your new password must be different from your current password'));
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      // remove the existing profile img from cloudinary to save the storage
      if (user.profileImg) {
        // https://res.cloudinary.com/username/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
        await cloudinary.uploader.destroy(
          user.profileImg.split('/').pop().split('.')[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      // remove the existing cover img from cloudinary to save the storage
      if (user.coverImg) {
        // https://res.cloudinary.com/username/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
        await cloudinary.uploader.destroy(
          user.coverImg.split('/').pop().split('.')[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(converImg);
      coverImg = uploadedResponse.secure_url;
    }

    // update user profile details
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    // password should be null in response
    user.password = null;

    return res.status(200).json(user);
  } catch (err) {
    console.error(`Error in updateUser ${err.message}`);
    next(err);
  }
};
