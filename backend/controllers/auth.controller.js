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
      return next(
        errorHandler(400, 'Password must be atleast 6 characters long')
      );
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
  } catch (err) {
    console.error('Error in signup controller', err.message);
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ''
    );

    if (!user || !isPasswordCorrect) {
      return next(errorHandler(400, 'Invalid username or password'));
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (err) {
    console.error('Error in signin controller', err.message);
    next(err);
  }
};

export const signout = async (req, res) => {
  try {
    res.cookie('jwt', '', {maxAge:0});
    res.status(200).json({message: 'Logged out successfully'});
  } catch (err) {
    console.error(`Error in signout controller ${err.message}`);
    next(err);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    console.error(`Error in getMe controller ${err.message}`);
    next(err);
  }
}
