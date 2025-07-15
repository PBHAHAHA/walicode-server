const path = require('path');
const { exec } = require('child_process');

// 运行数据库迁移
async function runMigration() {
  try {
    console.log('🚀 开始运行数据库迁移...');
    
    // 检查是否安装了 sequelize-cli
    const hasSequelizeCli = await new Promise((resolve) => {
      exec('npx sequelize-cli --version', (error) => {
        resolve(!error);
      });
    });

    if (!hasSequelizeCli) {
      console.log('📦 安装 sequelize-cli...');
      await new Promise((resolve, reject) => {
        exec('npm install -g sequelize-cli', (error, stdout, stderr) => {
          if (error) {
            console.error('❌ 安装 sequelize-cli 失败:', error);
            reject(error);
          } else {
            console.log('✅ sequelize-cli 安装成功');
            resolve();
          }
        });
      });
    }

    // 运行迁移
    await new Promise((resolve, reject) => {
      exec('npx sequelize-cli db:migrate', {
        cwd: path.resolve(__dirname, '..')
      }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ 数据库迁移失败:', error);
          console.error('stderr:', stderr);
          reject(error);
        } else {
          console.log('✅ 数据库迁移成功');
          console.log(stdout);
          resolve();
        }
      });
    });

    console.log('🎉 迁移完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 迁移过程出错:', error);
    process.exit(1);
  }
}

// 手动运行迁移（不使用 sequelize-cli）
async function manualMigration() {
  try {
    console.log('🚀 开始手动数据库迁移...');
    
    const db = require('../models/index');
    const { sequelize } = db;

    // 检查表是否存在
    const tableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('articles'));

    if (!tableExists) {
      console.log('❌ articles 表不存在，请先运行 npm run sync-db');
      process.exit(1);
    }

    // 检查 content 字段类型
    const tableDescription = await sequelize.getQueryInterface().describeTable('articles');
    const contentField = tableDescription.content;

    if (contentField && contentField.type.includes('TEXT')) {
      console.log('📝 检测到 content 字段为 TEXT 类型，开始转换为 JSON...');
      
      // 执行迁移脚本
      const migration = require('../migrations/20241202000000-update-article-content-to-json');
      await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
      
      console.log('✅ 内容字段已成功转换为 JSON 格式');
    } else if (contentField && contentField.type.includes('JSON')) {
      console.log('✅ content 字段已经是 JSON 类型，无需迁移');
    } else {
      console.log('⚠️  无法确定 content 字段类型，请检查数据库结构');
    }

    console.log('🎉 迁移检查完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 手动迁移失败:', error);
    process.exit(1);
  }
}

// 根据参数选择迁移方式
const args = process.argv.slice(2);
if (args.includes('--manual')) {
  manualMigration();
} else {
  runMigration();
} 