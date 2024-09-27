import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({to: userId}).populate({
            path: 'from',
            select: 'username profileImg'
        });

        await Notification.updateMany({to: userId}, {read: true});

        res.status(200).json(notifications);
    } catch (err) {
        console.error(`Error in getNotifications ${err.message}`);
        next(err);
    }
};