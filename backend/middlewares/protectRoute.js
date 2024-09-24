import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { errorHandler } from '../lib/utils/errorHandler.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return next(errorHandler(401, 'Unauthorized: No Token Provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(errorHandler(401, 'Unauthorized: Invalid Token'));
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // add user in the req object
    req.user = user;
    // call getMe function
    next();
  } catch (err) {
    console.error(`Error in protectRoute middleware ${err.messaage}`);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};
