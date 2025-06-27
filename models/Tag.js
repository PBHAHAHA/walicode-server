module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '标签ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '标签名称'
    },
  }, {
    tableName: 'tags',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  })

  

  // Tag.associate = (models) => {
  //   Tag.belongsToMany(models.Article, {
  //     through: 'ArticleTag',
  //     foreignKey: 'tag_id',
  //     otherKey: 'article_id',
  //     as: 'articles'
  //   })
  // }

  return Tag;
}