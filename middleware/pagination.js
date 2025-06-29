/**
 * 分页中间件
 * 统一处理请求中的分页参数，并将标准化的分页信息添加到请求对象中
 * 
 * 使用方法:
 * 1. 路由级别使用: router.get('/list', pagination(), controller.list);
 * 2. 应用级别使用: app.use(pagination()); // 全局应用
 * 
 * 支持的查询参数:
 * - page: 页码，默认为1
 * - limit/pageSize: 每页数量，默认为10
 * - sort: 排序字段，格式为 "field:order"，例如 "created_at:desc"
 * 
 * 添加到请求对象的属性:
 * - req.pagination: { page, limit, offset, sort, order }
 */

/**
 * 分页中间件工厂函数
 * @param {Object} options - 配置选项
 * @param {number} options.defaultPage - 默认页码
 * @param {number} options.defaultLimit - 默认每页数量
 * @param {number} options.maxLimit - 最大每页数量
 * @param {string} options.defaultSort - 默认排序字段
 * @param {string} options.defaultOrder - 默认排序方向 ('asc'|'desc')
 * @returns {Function} Express中间件函数
 */
function pagination(options = {}) {
  // 默认配置
  const config = {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
    defaultSort: 'created_at',
    defaultOrder: 'desc',
    ...options
  };

  // 返回中间件函数
  return (req, res, next) => {
    // 从查询参数中获取分页信息
    let page = parseInt(req.query.page) || config.defaultPage;
    let limit = parseInt(req.query.limit || req.query.pageSize) || config.defaultLimit;
    
    // 处理排序参数
    let sort = config.defaultSort;
    let order = config.defaultOrder;
    
    if (req.query.sort) {
      const sortParts = req.query.sort.split(':');
      if (sortParts.length > 0) {
        sort = sortParts[0];
        if (sortParts.length > 1) {
          order = sortParts[1].toLowerCase() === 'asc' ? 'asc' : 'desc';
        }
      }
    }

    // 验证和限制参数
    page = page > 0 ? page : 1;
    limit = limit > 0 ? (limit <= config.maxLimit ? limit : config.maxLimit) : config.defaultLimit;
    
    // 计算偏移量
    const offset = (page - 1) * limit;

    // 将分页信息添加到请求对象
    req.pagination = {
      page,
      limit,
      offset,
      sort,
      order
    };

    // 添加辅助方法，用于生成分页响应
    req.getPaginationData = function(count) {
      return {
        pagination: {
          total: count,
          page: this.pagination.page,
          limit: this.pagination.limit,
          pages: Math.ceil(count / this.pagination.limit),
          sort: this.pagination.sort,
          order: this.pagination.order
        }
      };
    };

    // 添加辅助方法，用于生成Sequelize查询选项
    req.getPaginationOptions = function() {
      return {
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order: [[this.pagination.sort, this.pagination.order]]
      };
    };

    next();
  };
}

module.exports = pagination; 