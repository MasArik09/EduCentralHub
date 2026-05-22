package controllers

import (
	"net/http"
	"time"

	"EduCentralHub/config"
	"EduCentralHub/models"

	"github.com/gin-gonic/gin"
)

// SubmitQuizInput defines the payload for a student submitting their quiz attempt
type SubmitQuizInput struct {
	QuizID    uint `json:"quiz_id" binding:"required"`
	StudentID uint `json:"student_id" binding:"required"`
	Score     int  `json:"score" binding:"required,min=0,max=100"`
}

// SubmitQuiz saves a student's quiz attempt to the database with a completed timestamp
func SubmitQuiz(c *gin.Context) {
	var input SubmitQuizInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Verify that the quiz exists
	var quiz models.Quiz
	if err := config.DB.First(&quiz, input.QuizID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Quiz not found"})
		return
	}

	// 2. Verify that the student exists and is indeed a student
	var student models.User
	if err := config.DB.First(&student, input.StudentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}
	if student.Role != "student" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Selected user is not a student"})
		return
	}

	// 3. Create the quiz attempt record
	attempt := models.QuizAttempt{
		QuizID:      input.QuizID,
		StudentID:   input.StudentID,
		Score:       input.Score,
		CompletedAt: time.Now(),
	}

	if err := config.DB.Create(&attempt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit quiz attempt"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Quiz attempt submitted successfully",
		"attempt": attempt,
	})
}
