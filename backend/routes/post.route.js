import express from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
import { getAllPosts, createPost, deletePost, commentOnPost, likeUnlikePost } from '../controllers/post.controller.js';

const router = express.Router();

router.get('/all', protectRoute, getAllPosts);
router.post('/create', protectRoute, createPost);
router.post('/like/:id', protectRoute, likeUnlikePost);
router.post('/comment/:id', protectRoute, commentOnPost);
router.delete('/:id', protectRoute, deletePost);

export default router;


