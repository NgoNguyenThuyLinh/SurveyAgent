/**
 * Script để hiển thị tất cả các bảng trong database
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Kết nối database
const sequelize = new Sequelize(
  process.env.DB_NAME || 'llm_survey_db',
  process.env.DB_USER || 'llm_survey_user',
  process.env.DB_PASSWORD || 'password123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql',
    logging: false
  }
);

async function showTables() {
  try {
    console.log(' Kết nối database...\n');
    
    await sequelize.authenticate();
    console.log(' Kết nối thành công!\n');
    
    // Lấy danh sách tất cả các bảng
    const [tables] = await sequelize.query('SHOW TABLES;');
    
    console.log(` Tổng số bảng: ${tables.length}\n`);
    console.log('═'.repeat(80));
    console.log('DANH SÁCH CÁC BẢNG:');
    console.log('═'.repeat(80));
    
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${(index + 1).toString().padStart(3)}. ${tableName}`);
    });
    
    console.log('═'.repeat(80));
    console.log('\n Chi tiết cấu trúc từng bảng:\n');
    
    // Lấy cấu trúc từng bảng
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log('\n' + '─'.repeat(80));
      console.log(` Bảng: ${tableName}`);
      console.log('─'.repeat(80));
      
      const [columns] = await sequelize.query(`DESCRIBE \`${tableName}\`;`);
      
      console.log('Cột'.padEnd(30) + 'Kiểu dữ liệu'.padEnd(20) + 'Null'.padEnd(8) + 'Key'.padEnd(8) + 'Default');
      console.log('─'.repeat(80));
      
      columns.forEach(col => {
        console.log(
          col.Field.padEnd(30) +
          col.Type.padEnd(20) +
          col.Null.padEnd(8) +
          (col.Key || '-').padEnd(8) +
          (col.Default || '-')
        );
      });
      
      // Đếm số dòng
      const [count] = await sequelize.query(`SELECT COUNT(*) as total FROM \`${tableName}\`;`);
      console.log(`\n Tổng số dòng: ${count[0].total}`);
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log(' Hoàn thành!');
    
  } catch (error) {
    console.error(' Lỗi:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

showTables();
