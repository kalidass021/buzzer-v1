import { v2 as cloudinary } from 'cloudinary';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import { errorHandler } from '../lib/utils/errorHandler.js';

export const createPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    
    if (!text && !img) {
      return next(errorHandler(400, 'Post must have text or image'));
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error(`Error in createPost ${err.message}`);
    next(err);
  }
};
