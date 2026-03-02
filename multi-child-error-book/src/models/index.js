// 数据库模型定义
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 家庭用户模型
const FamilyUser = sequelize.define('FamilyUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

// 孩子档案模型
const ChildProfile = sequelize.define('ChildProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  familyUserId: {
    type: DataTypes.UUID,
    references: {
      model: FamilyUser,
      key: 'id'
    }
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

// 学科配置模型
const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// 错题模型
const ErrorQuestion = sequelize.define('ErrorQuestion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  childId: {
    type: DataTypes.UUID,
    references: {
      model: ChildProfile,
      key: 'id'
    }
  },
  subjectId: {
    type: DataTypes.UUID,
    references: {
      model: Subject,
      key: 'id'
    }
  },
  originalImageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cleanedImageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ocrText: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  errorReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  knowledgePoint: {
    type: DataTypes.STRING,
    allowNull: true
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium'
  },
  isProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

// 复习提醒设置
const ReviewReminder = sequelize.define('ReviewReminder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  childId: {
    type: DataTypes.UUID,
    references: {
      model: ChildProfile,
      key: 'id'
    }
  },
  subjectId: {
    type: DataTypes.UUID,
    references: {
      model: Subject,
      key: 'id'
    }
  },
  reminderTime: {
    type: DataTypes.STRING,
    allowNull: false // "19:00"
  },
  frequency: {
    type: DataTypes.ENUM('daily', 'weekly', 'weekend'),
    defaultValue: 'daily'
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: true // 0-6, for weekly reminders
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// 建立关联关系
FamilyUser.hasMany(ChildProfile, { foreignKey: 'familyUserId' });
ChildProfile.belongsTo(FamilyUser, { foreignKey: 'familyUserId' });

ChildProfile.hasMany(ErrorQuestion, { foreignKey: 'childId' });
ErrorQuestion.belongsTo(ChildProfile, { foreignKey: 'childId' });

Subject.hasMany(ErrorQuestion, { foreignKey: 'subjectId' });
ErrorQuestion.belongsTo(Subject, { foreignKey: 'subjectId' });

ChildProfile.hasMany(ReviewReminder, { foreignKey: 'childId' });
ReviewReminder.belongsTo(ChildProfile, { foreignKey: 'childId' });

Subject.hasMany(ReviewReminder, { foreignKey: 'subjectId' });
ReviewReminder.belongsTo(Subject, { foreignKey: 'subjectId' });

module.exports = {
  FamilyUser,
  ChildProfile,
  Subject,
  ErrorQuestion,
  ReviewReminder,
  sequelize
};