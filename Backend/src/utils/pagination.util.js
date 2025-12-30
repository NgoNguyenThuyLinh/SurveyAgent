/**
 * Format paginated response consistently
 * @param {Array} items - Array of data items
 * @param {number} total - Total count of items in database
 * @param {number} page - Current page number
 * @param {number} pageSize - Items per page
 * @returns {Object} Standardized paginated response
 */
function formatPaginatedResponse(items, total, page, pageSize) {
  return {
    items: items,
    pagination: {
      total: total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page * pageSize < total,
      hasPreviousPage: page > 1
    }
  };
}

module.exports = { formatPaginatedResponse };
