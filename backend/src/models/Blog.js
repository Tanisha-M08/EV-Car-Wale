module.exports = {
  entity: 'blogs',
  primaryKey: { pk: 'BLOG#<category>#<slug>', sk: 'ARTICLE' },
  attributes: ['slug', 'category', 'categoryName', 'title', 'summary', 'htmlContent', 'featuredImage', 'status', 'publishedAt']
};
