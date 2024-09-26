import { v2 as cloudinary } from 'cloudinary';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Notification from '../models/notification.model.js';
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
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return next(errorHandler(400, 'Text field is required'));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    const comment = { user: userId, text };

    post.comments.push(comment);

    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error(`Error in commentOnPost ${err.message}`);
    next(err);
  }
};

export const likeUnlikePost = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // if user already liked the post
      // unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      // remove the postId from the user's likedPosts
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({ message: 'Post unliked successfully' });
      // we don't need to send any notification for unlike post
    }

    if (!userLikedPost) {
      // like the post
      post.likes.push(userId);
      // push the postId into user's likedPosts
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      // create a notification
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: 'like',
      });

      await notification.save();

      res.status(200).json({ message: 'Post liked successfully' });
    }
  } catch (err) {
    console.error(`Error in likeUnlikePost ${err.message}`);
    next(err);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'comments.user',
        select: '-password',
      });

    // in the above code without populate method it will retutn posts with userId only
    // but we want another user details to display in the frontend, we're getting that using populate
    // by using select method we're unselecting the password

    // if posts.length === 0
    if (!posts.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (err) {
    console.error(`Error in getAllPosts ${err.message}`);
    next(err);
  }
};

export const getLikedPosts = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'comments.user',
        select: '-password',
      });
    // in the above code without populate method we'll get liked posts with only user's id
    // but we need other details to display it in the frontend
    // with select method we're deselecting the password

    res.status(200).json(likedPosts);
  } catch (err) {
    console.error(`Error in getLikedPosts ${err.message}`);
    next(err);
  }
};

export const getFollowingPosts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'comments.user',
        select: '-password',
      });

    // without populate method we'll only get userId
    // with populate method we're getting the all user details to display in the frontend
    // with select method we're deselecting the password

    res.status(200).json(feedPosts);
  } catch (err) {
    console.error(`Error in getFollowingPosts ${err.message}`);
    next(err);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'comments.user',
        select: '-password',
      });
      // without populate method we'll only get userId

      res.status(200).json({posts});
  } catch (err) {
    console.error(`Error in getUserPosts ${err.message}`);
    next(err);
  }
};
