const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * PDF生成控制器
 */
class PDFController {
  /**
   * 生成练习卷PDF
   * @param {Object} practicePaper - 练习卷数据
   * @param {string} mode - 排版模式 ('practice' 刷题模式, 'review' 背题模式)
   * @returns {Promise<string>} - PDF文件路径
   */
  static async generatePracticePaperPDF(practicePaper, mode = 'practice') {
    try {
      const { title, questions, createdAt } = practicePaper;
      
      // 创建PDF文档
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      // 生成唯一文件名
      const filename = `practice-paper-${uuidv4()}.pdf`;
      const filePath = path.join(__dirname, '../../public/pdfs', filename);
      
      // 确保目录存在
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
      
      // 添加标题
      doc.fontSize(24).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`生成时间: ${new Date(createdAt).toLocaleString('zh-CN')}`, { align: 'center' });
      doc.moveDown(2);
      
      // 添加题目
      questions.forEach((question, index) => {
        const questionNumber = index + 1;
        
        // 题目内容
        doc.fontSize(14).text(`${questionNumber}. ${question.content}`);
        doc.moveDown(0.5);
        
        // 如果有图片，这里需要处理（简化处理）
        if (question.image) {
          doc.text('[题目图片]');
          doc.moveDown(0.5);
        }
        
        // 根据模式决定答案位置
        if (mode === 'review') {
          // 背题模式：答案紧跟题目
          doc.fontSize(12).fillColor('blue').text(`答案: ${question.answer}`);
          if (question.explanation) {
            doc.text(`解析: ${question.explanation}`);
          }
          doc.fillColor('black');
          doc.moveDown(1);
        } else {
          // 刷题模式：只留答题空间
          doc.moveDown(3); // 留出答题空间
        }
      });
      
      // 刷题模式下在最后添加答案和解析
      if (mode === 'practice' && questions.length > 0) {
        doc.addPage();
        doc.fontSize(18).text('参考答案与解析', { align: 'center' });
        doc.moveDown(2);
        
        questions.forEach((question, index) => {
          const questionNumber = index + 1;
          doc.fontSize(12).text(`${questionNumber}. 答案: ${question.answer}`);
          if (question.explanation) {
            doc.text(`   解析: ${question.explanation}`);
          }
          doc.moveDown(1);
        });
      }
      
      doc.end();
      
      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          resolve(`/pdfs/${filename}`);
        });
        writeStream.on('error', reject);
      });
    } catch (error) {
      console.error('生成PDF错误:', error);
      throw error;
    }
  }

  /**
   * 导出错题集PDF
   * @param {Array} errorQuestions - 错题列表
   * @param {string} childName - 孩子姓名
   * @param {string} subject - 学科
   * @returns {Promise<string>} - PDF文件路径
   */
  static async exportErrorQuestionsPDF(errorQuestions, childName, subject) {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const filename = `error-questions-${uuidv4()}.pdf`;
      const filePath = path.join(__dirname, '../../public/pdfs', filename);
      
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
      
      // 标题
      doc.fontSize(24).text(`${childName}的${subject}错题集`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`导出时间: ${new Date().toLocaleString('zh-CN')}`, { align: 'center' });
      doc.moveDown(2);
      
      // 错题列表
      errorQuestions.forEach((question, index) => {
        const questionNumber = index + 1;
        doc.fontSize(14).text(`${questionNumber}. ${question.ocrText || '题目内容'}`);
        doc.moveDown(1);
        
        // 显示错误原因和知识点
        if (question.errorReason) {
          doc.fontSize(10).fillColor('red').text(`错误原因: ${question.errorReason}`);
        }
        if (question.knowledgePoints && question.knowledgePoints.length > 0) {
          doc.text(`知识点: ${question.knowledgePoints.join(', ')}`);
        }
        doc.fillColor('black');
        doc.moveDown(2);
      });
      
      doc.end();
      
      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          resolve(`/pdfs/${filename}`);
        });
        writeStream.on('error', reject);
      });
    } catch (error) {
      console.error('导出错题集PDF错误:', error);
      throw error;
    }
  }
}

module.exports = PDFController;