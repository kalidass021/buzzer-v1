import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
import { errorHandler } from '../lib/utils/errorHandler.js';

export const signup = async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(errorHandler(400, 'Invalid email format'));
    }

    if (password.length < 6) {
      return next(errorHandler(400, 'Password must be atleast 6 characters long'));
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(errorHandler(400, 'Username already exists'));
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return next(errorHandler(400, 'Email alreay exists'));
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    try {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      console.log('newUser._doc', newUser._doc);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } catch (err) {
      console.error(`Error while saving user ${err.message}`);
      next(err);
    }

    // if (newUser) {

    // } else {
    //   return res.status(400).json({error: 'Inalid user data'});
    // }
  } catch (err) {
    console.error('Error in signup controller', err.message);
    next(err);
  }
};

export const signin = async (req, res) => {
  res.json({
    data: 'You hit the signin end point',
  });
};

export const signout = async (req, res) => {
  res.json({
    data: 'You hhit the signout end point',
  });
};
