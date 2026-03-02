const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

describe('Multi-Child Error Book Integration Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Child Management', () => {
    test('should create child profile', async () => {
      const response = await request(app)
        .post('/api/children')
        .send({
          name: '小明',
          grade: '三年级',
          subjects: ['数学', '语文', '英语']
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe('小明');
      expect(response.body.grade).toBe('三年级');
    });

    test('should switch between children', async () => {
      // Create two children
      const child1 = await request(app).post('/api/children').send({
        name: '小明', grade: '三年级', subjects: ['数学']
      });
      const child2 = await request(app).post('/api/children').send({
        name: '小红', grade: '五年级', subjects: ['数学', '英语']
      });

      // Switch to child1 context
      const switch1 = await request(app)
        .post('/api/children/switch')
        .send({ childId: child1.body.id });
      
      expect(switch1.statusCode).toBe(200);
      expect(switch1.body.currentChildId).toBe(child1.body.id);

      // Switch to child2 context  
      const switch2 = await request(app)
        .post('/api/children/switch')
        .send({ childId: child2.body.id });
      
      expect(switch2.statusCode).toBe(200);
      expect(switch2.body.currentChildId).toBe(child2.body.id);
    });
  });

  describe('Error Question Processing', () => {
    test('should process image and extract question', async () => {
      // Mock image processing
      const mockImageBuffer = Buffer.from('mock image data');
      
      const response = await request(app)
        .post('/api/error-questions/process-image')
        .field('childId', 'test-child-id')
        .field('subject', '数学')
        .attach('image', mockImageBuffer, 'test.jpg');
      
      // This would be more comprehensive with actual image processing
      expect(response.statusCode).toBe(200);
    });
  });

  describe('PDF Generation', () => {
    test('should generate PDF with error questions', async () => {
      const response = await request(app)
        .post('/api/pdf/generate')
        .send({
          questionIds: ['q1', 'q2', 'q3'],
          layoutMode: 'practice',
          paperSize: 'A4'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
    });
  });
});