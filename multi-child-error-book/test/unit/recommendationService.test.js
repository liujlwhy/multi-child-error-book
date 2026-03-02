const RecommendationService = require('../../src/services/recommendationService');
const ErrorQuestion = require('../../src/models/ErrorQuestion');

// Mock the ErrorQuestion model
jest.mock('../../src/models/ErrorQuestion');

describe('RecommendationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSimilarQuestions', () => {
    test('should return similar questions based on knowledge points', async () => {
      const mockOriginalQuestion = {
        id: '1',
        childId: 'child1',
        subject: '数学',
        grade: '5',
        knowledgePoints: ['分数运算', '小数运算']
      };
      
      const mockSimilarQuestions = [
        { id: '2', knowledgePoints: ['分数运算'], subject: '数学', grade: '5' },
        { id: '3', knowledgePoints: ['小数运算'], subject: '数学', grade: '5' }
      ];

      ErrorQuestion.findByPk.mockResolvedValue(mockOriginalQuestion);
      ErrorQuestion.findAll.mockResolvedValue(mockSimilarQuestions);

      const result = await RecommendationService.getSimilarQuestions('1', 2);

      expect(ErrorQuestion.findByPk).toHaveBeenCalledWith('1');
      expect(ErrorQuestion.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    test('should handle case when original question not found', async () => {
      ErrorQuestion.findByPk.mockResolvedValue(null);

      await expect(RecommendationService.getSimilarQuestions('nonexistent'))
        .rejects.toThrow('原错题不存在');
    });
  });

  describe('generatePracticePaper', () => {
    test('should generate practice paper with original and similar questions', async () => {
      const mockOriginalQuestions = [
        { id: '1', content: 'Question 1' },
        { id: '2', content: 'Question 2' }
      ];
      
      const mockSimilarQuestions = [
        { id: '3', content: 'Similar 1' },
        { id: '4', content: 'Similar 2' }
      ];

      ErrorQuestion.findAll.mockResolvedValue(mockOriginalQuestions);
      RecommendationService.getSimilarQuestions = jest.fn()
        .mockResolvedValueOnce(mockSimilarQuestions.slice(0, 1))
        .mockResolvedValueOnce(mockSimilarQuestions.slice(1, 2));

      const result = await RecommendationService.generatePracticePaper(
        ['1', '2'], 
        'child1', 
        { includeSimilar: true, similarCount: 1 }
      );

      expect(result.questions).toHaveLength(4);
      expect(result.originalCount).toBe(2);
      expect(result.similarCount).toBe(2);
    });
  });
});