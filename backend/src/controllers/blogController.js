const { asyncHandler } = require('../utils/asyncHandler');
const blogRepository = require('../repositories/blogRepository');
const { isDataStoreConfigured, emptyListResponse } = require('../utils/dataState');

const { fetchAndParseAllBlogs } = require('../services/blogFetcherService');

const listBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await fetchAndParseAllBlogs();
    
    // Apply filters if provided
    let filtered = [...blogs];
    
    if (req.query.search) {
      const q = String(req.query.search).toLowerCase();
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(q) || 
        blog.summary.toLowerCase().includes(q) || 
        blog.source.toLowerCase().includes(q) ||
        blog.author.toLowerCase().includes(q)
      );
    }
    
    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    console.error('Failed to list dynamic blogs:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch dynamic blogs' });
  }
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return res.status(404).json({ success: false, error: 'Blog not found' });

  const blog = await blogRepository.getBlogBySlug(req.params.category, req.params.slug);

  if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
  res.json({ success: true, data: blog });
});

module.exports = { listBlogs, getBlogBySlug };
