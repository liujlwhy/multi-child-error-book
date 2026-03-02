const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * 简化版PDF生成服务 - 使用PDFKit
 */
class SimplePDFService {
  /**
   * 生成错题练习卷PDF
   * @param {Array} questions - 错题列表
   * @param {Object} options - 生成选项
   * @param {string} childName - 孩子姓名
   * @returns {string} PDF文件路径
   */
  async generateErrorBookPDF(questions, options, childName) {
    const mode = options.mode || 'practice';
    const paperSize = options.paperSize || 'A4';
    
    // 设置页面尺寸
    let pageWidth, pageHeight;
    if (paperSize.toLowerCase() === 'a3') {
      pageWidth = 842;
      pageHeight = 1190;
    } else {
      // A4 default
      pageWidth = 595;
      pageHeight = 842;
    }
    
    const doc = new PDFDocument({
      size: [pageWidth, pageHeight],
      margins: { top: 72, bottom: 72, left: 72, right: 72 }
    });
    
    const timestamp = Date.now();
    const filename = `${childName}_错题集_${timestamp}.pdf`;
    const filePath = path.join('/tmp', filename);
    
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    
    // 添加标题
    doc.fontSize(24).text('智能错题集', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, { align: 'center' });
    doc.moveDown(2);
    
    // 添加题目
    questions.forEach((question, index) => {
      const questionNumber = index + 1;
      
      // 题目编号
      doc.fontSize(14).fillColor('red').text(`第${questionNumber}题`);
      doc.fillColor('black');
      doc.moveDown();
      
      // 题目内容
      const content = question.ocrText || question.content || '题目内容';
      doc.fontSize(12).text(content);
      doc.moveDown();
      
      // 错误原因和知识点
      if (question.errorReason) {
        doc.fontSize(10).fillColor('red').text(`错误原因: ${question.errorReason}`);
        doc.fillColor('black');
        doc.moveDown();
      }
      
      if (question.knowledgePoints && question.knowledgePoints.length > 0) {
        doc.fontSize(10).text(`知识点: ${question.knowledgePoints.join(', ')}`);
        doc.moveDown();
      }
      
      doc.moveDown();
    });
    
    // 刷题模式的答案部分
    if (mode === 'practice') {
      doc.addPage();
      doc.fontSize(18).text('答案与解析', { align: 'center' });
      doc.moveDown(2);
      
      questions.forEach((question, index) => {
        if (question.answer || question.explanation) {
          doc.fontSize(14).text(`第${index + 1}题:`);
          doc.fontSize(12).text(`${question.answer || ''}\n\n${question.explanation || ''}`);
          doc.moveDown(2);
        }
      });
    }
    
    doc.end();
    
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', reject);
    });
  }
}

module.exports = new SimplePDFService();