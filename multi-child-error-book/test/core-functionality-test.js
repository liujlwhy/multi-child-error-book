const PDFDocument = require('pdfkit');
const fs = require('fs');

// 测试PDF生成核心功能
console.log('🧪 测试PDF生成核心功能...');

try {
  const doc = new PDFDocument();
  const testFile = '/tmp/test-pdf.pdf';
  const writeStream = fs.createWriteStream(testFile);
  
  doc.pipe(writeStream);
  doc.fontSize(20).text('智能错题集测试', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('这是一个测试PDF文件，用于验证PDFKit功能。');
  doc.end();
  
  writeStream.on('finish', () => {
    console.log('✅ PDF生成成功!');
    console.log(`📄 文件位置: ${testFile}`);
    
    // 验证文件存在
    if (fs.existsSync(testFile)) {
      const stats = fs.statSync(testFile);
      console.log(`📊 文件大小: ${stats.size} bytes`);
      
      if (stats.size > 0) {
        console.log('✅ 核心PDF功能验证通过!');
      } else {
        console.log('❌ PDF文件为空');
      }
    } else {
      console.log('❌ PDF文件未创建');
    }
  });
  
  writeStream.on('error', (error) => {
    console.error('❌ PDF生成失败:', error);
  });
  
} catch (error) {
  console.error('❌ PDF测试失败:', error);
}