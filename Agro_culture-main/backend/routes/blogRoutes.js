const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  likeBlog,
  commentBlog
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBlogs)
  .post(protect, createBlog);

router.route('/:id')
  .get(getBlogById);

router.route('/:id/like')
  .post(protect, likeBlog);

router.route('/:id/comments')
  .post(protect, commentBlog);

module.exports = router;
