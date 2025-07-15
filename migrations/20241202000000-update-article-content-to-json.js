'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 首先备份现有的TEXT内容到临时列
    await queryInterface.addColumn('articles', 'content_backup', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '内容备份'
    });

    // 将现有内容复制到备份列
    await queryInterface.sequelize.query(
      'UPDATE articles SET content_backup = content WHERE content IS NOT NULL'
    );

    // 删除原content列
    await queryInterface.removeColumn('articles', 'content');

    // 添加新的JSON类型content列
    await queryInterface.addColumn('articles', 'content', {
      type: Sequelize.JSON,
      allowNull: false,
      comment: '文章内容（JSON格式）',
      defaultValue: {}
    });

    // 将备份的文本内容转换为简单的JSON格式
    await queryInterface.sequelize.query(`
      UPDATE articles 
      SET content = JSON_OBJECT(
        'type', 'doc',
        'content', JSON_ARRAY(
          JSON_OBJECT(
            'type', 'paragraph',
            'content', JSON_ARRAY(
              JSON_OBJECT(
                'type', 'text',
                'text', COALESCE(content_backup, '')
              )
            )
          )
        )
      )
      WHERE content_backup IS NOT NULL
    `);

    // 删除备份列
    await queryInterface.removeColumn('articles', 'content_backup');
  },

  async down(queryInterface, Sequelize) {
    // 回滚：将JSON内容转换回TEXT
    await queryInterface.addColumn('articles', 'content_text', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // 尝试从JSON中提取文本内容（简化处理）
    await queryInterface.sequelize.query(`
      UPDATE articles 
      SET content_text = COALESCE(
        JSON_UNQUOTE(JSON_EXTRACT(content, '$.content[0].content[0].text')),
        ''
      )
      WHERE content IS NOT NULL
    `);

    // 删除JSON列
    await queryInterface.removeColumn('articles', 'content');

    // 重新添加TEXT类型的content列
    await queryInterface.addColumn('articles', 'content', {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: '文章内容'
    });

    // 将转换的文本内容复制回去
    await queryInterface.sequelize.query(
      'UPDATE articles SET content = COALESCE(content_text, "") WHERE content_text IS NOT NULL'
    );

    // 删除临时列
    await queryInterface.removeColumn('articles', 'content_text');
  }
}; 