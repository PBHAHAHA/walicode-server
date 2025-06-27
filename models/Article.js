module.exports = (sequelize, DataTypes) => {    
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '文章ID'
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '文章标题'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '文章描述'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '文章内容'
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID'
    },
    tag_ids: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: true,
      comment: '标签ID列表'
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否发布'
    },
    is_top: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否置顶'
    },
    cover_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '封面图片'
    },
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '浏览量'
    },
    is_hot: { 
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否热门'
    },
  }, {
    tableName: 'articles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  })

  Article.associate = (models) => {
    Article.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    })
    Article.belongsToMany(models.Tag, {
      through: 'ArticleTag',
      foreignKey: 'article_id',
      otherKey: 'tag_id',
      as: 'tags'
    })
  }
} 