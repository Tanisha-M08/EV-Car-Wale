const { createRepository } = require('./dynamoRepository');

const repo = createRepository('blogs');

async function listBlogs(filters = {}) {
  const blogs = await repo.scan();
  return blogs
    .filter(blog => {
      if (blog.status && blog.status !== 'published') return false;
      if (filters.category && blog.category !== filters.category) return false;
      if (filters.search) {
        const q = String(filters.search).toLowerCase();
        const haystack = `${blog.title || ''} ${blog.summary || ''} ${blog.categoryName || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => String(b.publishedAt || b.createdAt || '').localeCompare(String(a.publishedAt || a.createdAt || '')));
}

async function getBlogBySlug(category, slug) {
  return repo.get({ pk: `BLOG#${category}#${slug}`, sk: 'ARTICLE' });
}

module.exports = { listBlogs, getBlogBySlug };
