const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');

// Public routes
router.get('/', postController.getPublicPosts);
router.get('/slug/:slug', postController.getPostBySlug);

// Admin routes
router.get('/admin', auth, postController.getAllPostsAdmin);
router.post('/', auth, postController.createPost);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);

module.exports = router;
