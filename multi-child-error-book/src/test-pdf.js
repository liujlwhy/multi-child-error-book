const puppeteer = require('puppeteer');

async function testPDF() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(`
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .question { margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; }
          .answer { margin-top: 10px; color: #666; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>智能错题练习卷</h1>
          <p>学生：小明 | 学科：数学 | 年级：三年级</p>
        </div>
        <div class="question">
          <h3>题目1：四边形面积计算</h3>
          <p>一个长方形的长是8cm，宽是5cm，求面积。</p>
          <div class="answer">答案：40 cm²</div>
        </div>
        <div class="question">
          <h3>题目2：举一反三</h3>
          <p>一个正方形的边长是6cm，求面积。</p>
          <div class="answer">答案：36 cm²</div>
        </div>
      </body>
    </html>
  `);
  
  await page.pdf({ path: 'test-output.pdf', format: 'A4' });
  await browser.close();
  console.log('PDF生成成功！');
}

testPDF().catch(console.error);