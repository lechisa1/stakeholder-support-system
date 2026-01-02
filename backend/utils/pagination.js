// utils/pagination.js
const getPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    limit: parseInt(limit),
    offset: parseInt(offset)
  };
};

const getPagingData = (data, page, limit) => {
  const { count: total, rows: results } = data;
  const currentPage = parseInt(page);
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    totalPages,
    currentPage,
    limit: parseInt(limit),
    results
  };
};

module.exports = {
  getPagination,
  getPagingData
};
