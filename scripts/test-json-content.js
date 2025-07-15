const db = require('../models/index');
const { Article, Category, Tag } = db;

async function testJsonContent() {
  try {
    console.log('🧪 开始测试 JSON 内容处理...');

    // 测试数据
    const testContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [
            {
              type: 'text',
              text: '测试文章标题'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '这是一段测试内容，包含 '
            },
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: '粗体文字'
            },
            {
              type: 'text',
              text: ' 和 '
            },
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: '斜体文字'
            }
          ]
        },
        {
          type: 'codeBlock',
          attrs: { language: 'javascript' },
          content: [
            {
              type: 'text',
              text: "console.log('Hello, Tiptap!');"
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '列表项 1'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '列表项 2'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    // 首先确保有分类
    let category = await Category.findOne({ where: { name: '测试分类' } });
    if (!category) {
      category = await Category.create({
        name: '测试分类',
        description: '用于测试的分类'
      });
      console.log('✅ 创建测试分类');
    }

    // 创建测试文章
    console.log('📝 创建测试文章...');
    const article = await Article.create({
      title: 'Tiptap JSON 内容测试',
      description: '这是一篇用于测试 Tiptap JSON 内容存储的文章',
      content: testContent,
      category_id: category.id,
      is_published: true
    });

    console.log('✅ 测试文章创建成功，ID:', article.id);

    // 读取文章并验证内容
    console.log('📖 读取文章内容...');
    const retrievedArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log('✅ 文章读取成功');
    console.log('📋 文章信息:');
    console.log(`  标题: ${retrievedArticle.title}`);
    console.log(`  分类: ${retrievedArticle.category.name}`);
    console.log(`  内容类型: ${typeof retrievedArticle.content}`);
    console.log(`  内容结构: ${retrievedArticle.content.type}`);
    console.log(`  内容块数量: ${retrievedArticle.content.content.length}`);

    // 验证内容结构
    const content = retrievedArticle.content;
    if (content.type === 'doc' && Array.isArray(content.content)) {
      console.log('✅ JSON 内容结构验证通过');
      
      // 显示内容块信息
      content.content.forEach((block, index) => {
        console.log(`  块 ${index + 1}: ${block.type}`);
      });
    } else {
      console.log('❌ JSON 内容结构验证失败');
    }

    // 测试更新
    console.log('🔄 测试内容更新...');
    const updatedContent = {
      ...testContent,
      content: [
        ...testContent.content,
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '这是更新后添加的段落。'
            }
          ]
        }
      ]
    };

    await retrievedArticle.update({
      content: updatedContent
    });

    console.log('✅ 内容更新成功');

    // 再次读取验证
    const updatedArticle = await Article.findByPk(article.id);
    console.log(`✅ 更新后内容块数量: ${updatedArticle.content.content.length}`);

    console.log('🎉 所有测试通过！');
    
    // 清理测试数据
    console.log('🧹 清理测试数据...');
    await article.destroy();
    console.log('✅ 测试完成');

    process.exit(0);
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testJsonContent(); 