

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '分类ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true, // 分类名称唯一
      comment: '分类名称'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '分类描述'
    },
  }, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (category) => {
        if (category.description) {
          category.description = category.description.trim();
        }
      }
    }
  })

  // // 定义模型关联关系
  // Category.associate = (models) => {
  //   // 一个分类可以有多篇文章（一对多关系）
  //   // foreignKey: 'category_id' - 在Article表中的外键字段名
  //   // as: 'articles' - 关联的别名，用于查询时引用
  //   Category.hasMany(models.Article, {
  //     foreignKey: 'category_id',
  //     as: 'articles'
  //   })
  // }

  return Category;
}