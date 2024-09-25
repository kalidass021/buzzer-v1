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

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return next(
        errorHandler(401, 'You are not authorized to delete this post')
      );
    }

    if (post.img) {
      const imgId = post.img.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(`Error in deletePost ${err.message}`);
    next(err);
  }
};

export const commentOnPost = async (req, res, next) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return next(errorHandler(400, 'Text field is required'));
        }

        const post = await Post.findById(postId);
        if (!post) {
            return next(errorHandler(404, 'Post not found'));
        }
        
        const comment = {user: userId, text};

        post.comments.push(comment);

        await post.save();

        res.status(200).json(post);

    } catch (err) {
        console.error(`Error in commentOnPost ${err.message}`);
        next(err);
    }
};
