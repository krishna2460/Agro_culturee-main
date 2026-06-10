const Blog = require('../models/Blog');

// @desc    Get all blog posts
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single blog post details
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a blog post
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const blog = new Blog({
      authorId: req.user._id,
      authorUsername: req.user.username,
      title,
      content,
      likes: [],
      comments: []
    });

    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like / Unlike a blog post
// @route   POST /api/blogs/:id/like
// @access  Private
const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
      const alreadyLikedIdx = blog.likes.findIndex(
        (like) => like.userId.toString() === req.user._id.toString()
      );

      if (alreadyLikedIdx > -1) {
        // Already liked, so unlike it
        blog.likes.splice(alreadyLikedIdx, 1);
        await blog.save();
        res.json({ message: 'Blog unliked successfully', likes: blog.likes });
      } else {
        // Add like
        blog.likes.push({
          userId: req.user._id,
          username: req.user.username
        });
        await blog.save();
        res.json({ message: 'Blog liked successfully', likes: blog.likes });
      }
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to blog post
// @route   POST /api/blogs/:id/comments
// @access  Private
const commentBlog = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const blog = await Blog.findById(req.params.id);

    if (blog) {
      const profilePic = req.user.profile.picStatus === 1
        ? `${req.user.username}.${req.user.profile.picExt}`
        : 'profile0.png';

      const newComment = {
        username: req.user.username,
        profilePic,
        comment,
        createdAt: new Date()
      };

      blog.comments.push(newComment);
      await blog.save();

      res.status(201).json({ message: 'Comment added successfully', comments: blog.comments });
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  likeBlog,
  commentBlog
};
