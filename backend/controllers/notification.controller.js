import Notification from '../models/notification.model.js';
import { errorHandler } from '../lib/utils/errorHandler.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId }).populate({
      path: 'from',
      select: 'username profileImg',
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (err) {
    console.error(`Error in getNotifications ${err.message}`);
    next(err);
  }
};

// delete all notifications
export const deleteNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: 'Notifications deleted successfully' });
  } catch (err) {
    console.error(`Error in deleteNotifications ${err.message}`);
    next(err);
  }
};

// delete one notification
// export const deleteNotification = async (req, res, next) => {
//     try {
//         const notificationId = req.params.id;
//         const userId = req.user._id;
        
//         const notification = await Notification.findById(notificationId);

//         if (!notification) {
//             return next(errorHandler(404, 'Notification not found'));
//         }

//         if (notification.to.toString() !== userId.toString()) {
//             return next(errorHandler(402, "You're not allowed to delete this notification"));
//         }

//         await Notification.findByIdAndDelete(notificationId);

//         res.status(200).json({message: 'Notification deleted successfully'});
//     } catch (err) {
//         console.error(`Error in deleteNotification ${err.message}`);
//         next(err);
//     }
// };