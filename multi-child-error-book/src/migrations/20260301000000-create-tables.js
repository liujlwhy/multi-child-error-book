'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 创建家庭用户表
    await queryInterface.createTable('FamilyUsers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建孩子档案表
    await queryInterface.createTable('ChildProfiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      familyUserId: {
        type: Sequelize.UUID,
        references: {
          model: 'FamilyUsers',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      nickname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      grade: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建学科表
    await queryInterface.createTable('Subjects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      grade: {
        type: Sequelize.STRING,
        allowNull: false
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });

    // 创建错题表
    await queryInterface.createTable('ErrorQuestions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      childId: {
        type: Sequelize.UUID,
        references: {
          model: 'ChildProfiles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.UUID,
        references: {
          model: 'Subjects',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      originalImageUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cleanedImageUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ocrText: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      errorReason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      knowledgePoint: {
        type: Sequelize.STRING,
        allowNull: true
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium'
      },
      isProcessed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      reviewStatus: {
        type: Sequelize.ENUM('pending', 'reviewed', 'mastered'),
        defaultValue: 'pending'
      },
      lastReviewedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建复习提醒表
    await queryInterface.createTable('ReviewReminders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      childId: {
        type: Sequelize.UUID,
        references: {
          model: 'ChildProfiles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.UUID,
        references: {
          model: 'Subjects',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      reminderTime: {
        type: Sequelize.STRING,
        allowNull: false
      },
      frequency: {
        type: Sequelize.ENUM('daily', 'weekly', 'weekend'),
        defaultValue: 'daily'
      },
      dayOfWeek: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ReviewReminders');
    await queryInterface.dropTable('ErrorQuestions');
    await queryInterface.dropTable('Subjects');
    await queryInterface.dropTable('ChildProfiles');
    await queryInterface.dropTable('FamilyUsers');
  }
};