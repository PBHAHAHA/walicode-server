# Tiptap JSON 内容存储指南

## 概述

本系统已更新为支持 Tiptap 编辑器的 JSON 格式内容存储。这种格式能够完整保留富文本的结构和样式信息。

## 数据库迁移

### 自动迁移（推荐）

```bash
# 运行数据库迁移
npm run migrate-manual
```

### 手动迁移

如果自动迁移失败，可以手动执行：

```bash
# 使用 sequelize-cli（需要先安装）
npm install -g sequelize-cli
npm run migrate
```

## JSON 内容格式

### 基本结构

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Hello World"
        }
      ]
    }
  ]
}
```

### 支持的内容类型

#### 1. 标题
```json
{
  "type": "heading",
  "attrs": { "level": 1 },
  "content": [
    {
      "type": "text",
      "text": "标题文本"
    }
  ]
}
```

#### 2. 段落
```json
{
  "type": "paragraph",
  "content": [
    {
      "type": "text",
      "text": "普通文本"
    },
    {
      "type": "text",
      "marks": [{ "type": "bold" }],
      "text": "粗体文本"
    }
  ]
}
```

#### 3. 代码块
```json
{
  "type": "codeBlock",
  "attrs": { "language": "javascript" },
  "content": [
    {
      "type": "text",
      "text": "console.log('Hello World');"
    }
  ]
}
```

#### 4. 列表
```json
{
  "type": "bulletList",
  "content": [
    {
      "type": "listItem",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "列表项"
            }
          ]
        }
      ]
    }
  ]
}
```

#### 5. 图片
```json
{
  "type": "image",
  "attrs": {
    "src": "https://example.com/image.jpg",
    "alt": "图片描述"
  }
}
```

## API 使用

### 创建文章

```javascript
// POST /api/articles/create
{
  "title": "文章标题",
  "description": "文章描述",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [
          {
            "type": "text",
            "text": "文章标题"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "文章内容..."
          }
        ]
      }
    ]
  },
  "category_id": 1,
  "is_published": true
}
```

### 更新文章

```javascript
// PUT /api/articles/:id
{
  "content": {
    "type": "doc",
    "content": [
      // 更新的内容结构
    ]
  }
}
```

## 向后兼容性

系统支持以下格式的内容输入：

### 1. JSON 对象（推荐）
直接传入 Tiptap JSON 格式对象。

### 2. 字符串格式
如果传入字符串，系统会自动转换为基本的 JSON 格式：

```javascript
// 输入
"这是一段文本内容"

// 自动转换为
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "这是一段文本内容"
        }
      ]
    }
  ]
}
```

## 测试验证

运行测试脚本验证 JSON 内容处理：

```bash
npm run test-json
```

该脚本会：
1. 创建包含各种内容类型的测试文章
2. 验证内容的存储和读取
3. 测试内容更新功能
4. 清理测试数据

## 前端集成

前端 TiptapRenderer 组件已更新，可以直接处理 JSON 格式内容：

```vue
<template>
  <TiptapRenderer :content="article.content" />
</template>
```

## 注意事项

1. **数据验证**：系统会验证 JSON 内容的基本结构，确保包含 `type` 和 `content` 字段。

2. **错误处理**：如果内容格式不正确，API 会返回相应的错误信息。

3. **性能考虑**：JSON 格式的内容会比纯文本稍大，但提供了更丰富的功能。

4. **备份建议**：在进行迁移前，建议备份现有数据。

## 常见问题

### Q: 迁移后原有的文本内容会丢失吗？
A: 不会。迁移脚本会将原有的文本内容转换为对应的 JSON 格式。

### Q: 可以同时支持文本和 JSON 格式吗？
A: 可以。API 会自动检测内容格式并进行相应处理。

### Q: 如何回滚到文本格式？
A: 运行迁移的 down 方法：`npm run migrate-manual -- --down`

## 相关文档

- [Tiptap 官方文档](https://tiptap.dev/)
- [JSON Schema 规范](https://tiptap.dev/guide/output#option-1-json)
- [API 文档](./article-api-docs.md) 