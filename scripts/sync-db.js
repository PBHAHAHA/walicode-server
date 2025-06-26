const db = require('../models/index');
const { User } = db;
const { sequelize } = db;

async function syncDatabase() {
  try {
    // 同步所有模型到数据库
    await sequelize.sync({ force: false });
    console.log('✅ 数据库同步成功');
    
    // 创建示例用户（可选）
    const userExists = await User.findOne({ where: { username: 'admin' } });
    if (!userExists) {
      await User.create({
        username: 'admin',
        password: '123456',
        email: 'admin@example.com',
        nickname: '管理员',
        avatar: 'https://via.placeholder.com/150'
      });
      console.log('✅ 示例用户创建成功');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    process.exit(1);
  }
}

syncDatabase();