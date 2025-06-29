# 文章管理 API 接口文档

## 基础信息

- 基础URL: `http://localhost:4444/api/articles`
- 所有接口返回格式: JSON
- Content-Type: `application/json`

## 接口列表

### 1. 创建文章

**POST** `/create`

**请求参数:**
```json
{
  "title": "文章标题",
  "description": "文章描述（可选）",
  "content": "文章内容",
  "category_id": 1,
  "tag_ids": [1, 2, 3],
  "is_published": true,
  "is_top": false,
  "cover_image": "封面图片URL（可选）"
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "文章创建成功",
  "data": {
    "id": 1,
    "title": "文章标题",
    "description": "文章描述",
    "content": "文章内容",
    "category_id": 1,
    "is_published": true,
    "is_top": false,
    "cover_image": "封面图片URL",
    "view_count": 0,
    "is_hot": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "category": {
      "id": 1,
      "name": "分类名称"
    },
    "tags": [
      {
        "id": 1,
        "name": "标签名称"
      }
    ]
  }
}
```

### 2. 获取文章列表

**GET** `/list`

**查询参数:**
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 10）
- `category_id`: 分类ID筛选
- `tag_id`: 标签ID筛选
- `is_published`: 是否发布（true/false）
- `is_top`: 是否置顶（true/false）
- `is_hot`: 是否热门（true/false）
- `keyword`: 关键词搜索（标题和描述）

**响应示例:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": 1,
        "title": "文章标题",
        "description": "文章描述",
        "category_id": 1,
        "is_published": true,
        "is_top": false,
        "cover_image": "封面图片URL",
        "view_count": 10,
        "is_hot": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "category": {
          "id": 1,
          "name": "分类名称"
        },
        "tags": [
          {
            "id": 1,
            "name": "标签名称"
          }
        ]
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
}
```

### 3. 获取文章详情

**GET** `/:id`

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "文章标题",
    "description": "文章描述",
    "content": "文章完整内容",
    "category_id": 1,
    "is_published": true,
    "is_top": false,
    "cover_image": "封面图片URL",
    "view_count": 11,
    "is_hot": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "category": {
      "id": 1,
      "name": "分类名称"
    },
    "tags": [
      {
        "id": 1,
        "name": "标签名称"
      }
    ]
  }
}
```

### 4. 更新文章

**PUT** `/:id`

**请求参数:**
```json
{
  "title": "新标题（可选）",
  "description": "新描述（可选）",
  "content": "新内容（可选）",
  "category_id": 2,
  "tag_ids": [2, 3, 4],
  "is_published": false,
  "is_top": true,
  "cover_image": "新封面图片URL（可选）",
  "is_hot": true
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "文章更新成功",
  "data": {
    // 更新后的文章完整信息
  }
}
```

### 5. 删除文章

**DELETE** `/:id`

**响应示例:**
```json
{
  "success": true,
  "message": "文章删除成功"
}
```

### 6. 批量删除文章

**DELETE** `/batch/:ids`

**URL参数:**
- `ids`: 文章ID列表，用逗号分隔（如: `1,2,3`）

**响应示例:**
```json
{
  "success": true,
  "message": "成功删除 3 篇文章"
}
```

### 7. 切换发布状态

**PATCH** `/:id/toggle-publish`

**响应示例:**
```json
{
  "success": true,
  "message": "文章已发布",
  "data": {
    "is_published": true
  }
}
```

### 8. 切换置顶状态

**PATCH** `/:id/toggle-top`

**响应示例:**
```json
{
  "success": true,
  "message": "文章已置顶",
  "data": {
    "is_top": true
  }
}
```

### 9. 切换热门状态

**PATCH** `/:id/toggle-hot`

**响应示例:**
```json
{
  "success": true,
  "message": "文章已设为热门",
  "data": {
    "is_hot": true
  }
}
```

## 错误响应格式

```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误信息（开发环境）"
}
```

## 常见HTTP状态码

- `200`: 请求成功
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

## 数据模型

### Article 文章模型

```javascript
{
  id: INTEGER,              // 文章ID
  title: STRING(100),       // 文章标题
  description: STRING(255), // 文章描述
  content: TEXT,            // 文章内容
  category_id: INTEGER,     // 分类ID
  is_published: BOOLEAN,    // 是否发布
  is_top: BOOLEAN,          // 是否置顶
  cover_image: STRING(255), // 封面图片
  view_count: INTEGER,      // 浏览量
  is_hot: BOOLEAN,          // 是否热门
  created_at: DATE,         // 创建时间
  updated_at: DATE          // 更新时间
}
```

### 关联关系

- **Article belongsTo Category**: 文章属于一个分类
- **Article belongsToMany Tag**: 文章与标签多对多关系
- **Category hasMany Article**: 分类包含多篇文章
- **Tag belongsToMany Article**: 标签与文章多对多关系

## 使用示例

### 创建一篇文章

```javascript
const response = await fetch('http://localhost:4444/api/articles/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: '我的第一篇文章',
    description: '这是一篇测试文章',
    content: '文章的详细内容...',
    category_id: 1,
    tag_ids: [1, 2],
    is_published: true
  })
});

const result = await response.json();
console.log(result);
```

### 获取文章列表

```javascript
const response = await fetch('http://localhost:4444/api/articles/list?page=1&limit=5&is_published=true');
const result = await response.json();
console.log(result.data.articles);
``` 