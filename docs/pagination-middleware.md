# 分页中间件使用文档

## 简介

分页中间件是一个用于处理API请求中分页、排序参数的Express中间件。它可以标准化分页逻辑，简化控制器代码，提高代码复用性。

## 功能特点

- 自动解析请求中的分页参数（页码、每页数量）
- 自动解析排序参数（排序字段、排序方向）
- 支持自定义默认值和最大限制
- 提供辅助方法生成分页响应和查询选项
- 与Sequelize ORM无缝集成

## 安装

中间件已集成在项目中，无需额外安装。

## 基本用法

### 1. 引入中间件

```javascript
const pagination = require('../middleware/pagination');
```

### 2. 在路由中使用

```javascript
// 使用默认配置
router.get('/users', pagination(), async (req, res) => {
  // 路由处理逻辑
});

// 使用自定义配置
router.get('/posts', pagination({
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 50,
  defaultSort: 'created_at',
  defaultOrder: 'desc'
}), async (req, res) => {
  // 路由处理逻辑
});
```

## 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| defaultPage | Number | 1 | 默认页码 |
| defaultLimit | Number | 10 | 默认每页数量 |
| maxLimit | Number | 100 | 最大每页数量 |
| defaultSort | String | 'created_at' | 默认排序字段 |
| defaultOrder | String | 'desc' | 默认排序方向 ('asc'或'desc') |

## 请求参数

客户端可以通过以下URL参数控制分页和排序：

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| page | Number | 请求的页码 | `?page=2` |
| limit / pageSize | Number | 每页数量 | `?limit=20` 或 `?pageSize=20` |
| sort | String | 排序字段和方向 | `?sort=username:asc` |

## 中间件提供的方法

中间件会在请求对象上添加以下属性和方法：

### req.pagination

包含解析后的分页信息：

```javascript
{
  page: Number,    // 当前页码
  limit: Number,   // 每页数量
  offset: Number,  // 数据偏移量 (用于数据库查询)
  sort: String,    // 排序字段
  order: String    // 排序方向 ('asc'或'desc')
}
```

### req.getPaginationOptions()

返回适用于Sequelize查询的选项对象：

```javascript
{
  limit: Number,   // 每页数量
  offset: Number,  // 数据偏移量
  order: [[String, String]]  // 排序配置
}
```

### req.getPaginationData(count)

生成标准的分页响应数据：

```javascript
{
  pagination: {
    total: Number,   // 总记录数 (来自count参数)
    page: Number,    // 当前页码
    limit: Number,   // 每页数量
    pages: Number,   // 总页数
    sort: String,    // 排序字段
    order: String    // 排序方向
  }
}
```

## 使用示例

### 基本查询

```javascript
router.get('/users', pagination(), async (req, res) => {
  try {
    // 获取分页选项
    const options = req.getPaginationOptions();
    
    // 使用分页选项进行查询
    const { count, rows } = await User.findAndCountAll(options);
    
    // 返回结果，包含分页信息
    res.json({
      success: true,
      data: {
        users: rows,
        ...req.getPaginationData(count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### 带筛选条件的查询

```javascript
router.get('/comments', pagination(), async (req, res) => {
  try {
    const { post_id, user_id } = req.query;
    
    // 构建查询条件
    const where = {};
    if (post_id) where.post_id = post_id;
    if (user_id) where.user_id = user_id;
    
    // 获取分页选项并添加查询条件
    const options = {
      ...req.getPaginationOptions(),
      where
    };
    
    const { count, rows } = await Comment.findAndCountAll(options);
    
    res.json({
      success: true,
      data: {
        comments: rows,
        ...req.getPaginationData(count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### 自定义排序

```javascript
router.get('/trending-posts', pagination(), async (req, res) => {
  try {
    // 获取基本分页选项
    const options = req.getPaginationOptions();
    
    // 自定义排序 - 先按热度排序，再按创建时间排序
    options.order = [
      ['view_count', 'DESC'],
      ['likes', 'DESC'],
      ['created_at', 'DESC']
    ];
    
    const { count, rows } = await Post.findAndCountAll(options);
    
    res.json({
      success: true,
      data: {
        posts: rows,
        ...req.getPaginationData(count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

## 客户端请求示例

```
# 基本分页
GET /api/users?page=1&limit=10

# 带排序的分页
GET /api/users?page=2&limit=20&sort=username:asc

# 带筛选的分页
GET /api/comments?post_id=123&page=1&limit=50

# 搜索带分页
GET /api/search?q=关键词&page=1&limit=10&sort=relevance:desc
```

## 标准响应格式

```json
{
  "success": true,
  "data": {
    "items": [...],  // 数据项数组
    "pagination": {
      "total": 100,  // 总记录数
      "page": 2,     // 当前页码
      "limit": 10,   // 每页数量
      "pages": 10,   // 总页数
      "sort": "created_at",  // 排序字段
      "order": "desc"        // 排序方向
    }
  }
}
```

## 最佳实践

1. 在需要分页的路由上使用此中间件
2. 使用`req.getPaginationOptions()`获取查询选项
3. 使用`req.getPaginationData(count)`生成分页响应
4. 对于复杂排序，可以覆盖`options.order`
5. 始终使用`try/catch`处理异常 