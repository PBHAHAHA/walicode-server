const axios = require('axios');

const BASE_URL = 'http://localhost:4444/api';

// 测试数据
const testData = {
  category: {
    name: '技术分享',
    description: '技术相关的文章分类'
  },
  tags: [
    { name: 'JavaScript' },
    { name: 'Node.js' },
    { name: 'Express' }
  ],
  article: {
    title: '如何使用Express构建RESTful API',
    description: '本文详细介绍了如何使用Express框架构建RESTful API，包括路由设计、中间件使用等。',
    content: '# Express RESTful API 开发指南\n\n## 简介\n\nExpress是一个简洁而灵活的Node.js Web应用框架...',
    is_published: true,
    is_top: false,
    cover_image: 'https://example.com/cover.jpg'
  }
};

async function testArticleAPIs() {
  try {
    console.log('🚀 开始测试文章相关接口...\n');

    // 1. 创建分类
    console.log('1. 创建测试分类...');
    const categoryResponse = await axios.post(`${BASE_URL}/categories`, testData.category);
    const categoryId = categoryResponse.data.data.id;
    console.log('✅ 分类创建成功:', categoryResponse.data.data);

    // 2. 创建标签
    console.log('\n2. 创建测试标签...');
    const tagIds = [];
    for (const tag of testData.tags) {
      const tagResponse = await axios.post(`${BASE_URL}/tags`, tag);
      tagIds.push(tagResponse.data.data.id);
      console.log('✅ 标签创建成功:', tagResponse.data.data);
    }

    // 3. 创建文章
    console.log('\n3. 创建测试文章...');
    const articleData = {
      ...testData.article,
      category_id: categoryId,
      tag_ids: tagIds
    };
    const articleResponse = await axios.post(`${BASE_URL}/articles/create`, articleData);
    const articleId = articleResponse.data.data.id;
    console.log('✅ 文章创建成功:', articleResponse.data.data);

    // 4. 获取文章列表
    console.log('\n4. 获取文章列表...');
    const listResponse = await axios.get(`${BASE_URL}/articles/list?page=1&limit=10`);
    console.log('✅ 文章列表获取成功:', {
      total: listResponse.data.data.pagination.total,
      articles: listResponse.data.data.articles.length
    });

    // 5. 获取文章详情
    console.log('\n5. 获取文章详情...');
    const detailResponse = await axios.get(`${BASE_URL}/articles/${articleId}`);
    console.log('✅ 文章详情获取成功:', {
      id: detailResponse.data.data.id,
      title: detailResponse.data.data.title,
      tags: detailResponse.data.data.tags.map(tag => tag.name),
      category: detailResponse.data.data.category.name
    });

    // 6. 更新文章
    console.log('\n6. 更新文章...');
    const updateData = {
      title: '如何使用Express构建RESTful API（更新版）',
      is_hot: true
    };
    const updateResponse = await axios.put(`${BASE_URL}/articles/${articleId}`, updateData);
    console.log('✅ 文章更新成功:', {
      title: updateResponse.data.data.title,
      is_hot: updateResponse.data.data.is_hot
    });

    // 7. 切换置顶状态
    console.log('\n7. 切换文章置顶状态...');
    const toggleTopResponse = await axios.patch(`${BASE_URL}/articles/${articleId}/toggle-top`);
    console.log('✅ 置顶状态切换成功:', toggleTopResponse.data);

    // 8. 按分类筛选文章
    console.log('\n8. 按分类筛选文章...');
    const categoryFilterResponse = await axios.get(`${BASE_URL}/articles/list?category_id=${categoryId}`);
    console.log('✅ 分类筛选成功:', {
      total: categoryFilterResponse.data.data.pagination.total
    });

    // 9. 按标签筛选文章
    console.log('\n9. 按标签筛选文章...');
    const tagFilterResponse = await axios.get(`${BASE_URL}/articles/list?tag_id=${tagIds[0]}`);
    console.log('✅ 标签筛选成功:', {
      total: tagFilterResponse.data.data.pagination.total
    });

    // 10. 关键词搜索
    console.log('\n10. 关键词搜索文章...');
    const searchResponse = await axios.get(`${BASE_URL}/articles/list?keyword=Express`);
    console.log('✅ 关键词搜索成功:', {
      total: searchResponse.data.data.pagination.total
    });

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
if (require.main === module) {
  testArticleAPIs();
}

module.exports = testArticleAPIs; 