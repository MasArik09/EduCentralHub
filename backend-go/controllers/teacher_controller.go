package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"EduCentralHub/config"
	"EduCentralHub/models"

	"github.com/gin-gonic/gin"
)

// CreateSubjectInput defines the payload for creating a new subject
type CreateSubjectInput struct {
	SubjectName string `json:"subject_name" binding:"required"`
	ClassID     uint   `json:"class_id" binding:"required"`
	TeacherID   uint   `json:"teacher_id" binding:"required"`
}

// CreateQuizInput defines the payload for creating a new quiz
type CreateQuizInput struct {
	Title     string `json:"title" binding:"required"`
	Duration  int    `json:"duration" binding:"required,gt=0"`
	SubjectID uint   `json:"subject_id" binding:"required"`
}

// CreateSubject allows a teacher to create a new subject bound to a class
func CreateSubject(c *gin.Context) {
	var input CreateSubjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify that the class exists
	var class models.Class
	if err := config.DB.First(&class, input.ClassID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	// Verify that the teacher exists and has the role "teacher"
	var teacher models.User
	if err := config.DB.First(&teacher, input.TeacherID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}
	if teacher.Role != "teacher" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Selected user is not a teacher"})
		return
	}

	subject := models.Subject{
		SubjectName: input.SubjectName,
		ClassID:     input.ClassID,
		TeacherID:   input.TeacherID,
	}

	if err := config.DB.Create(&subject).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subject"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Subject created successfully",
		"subject": subject,
	})
}

// UploadMaterial handles file uploads for study materials by a teacher
func UploadMaterial(c *gin.Context) {
	// Parse title from post form
	title := c.PostForm("title")
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	// Parse subject_id from post form
	subjectIDStr := c.PostForm("subject_id")
	if subjectIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "subject_id is required"})
		return
	}
	subjectID, err := strconv.ParseUint(subjectIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject_id format"})
		return
	}

	// Verify that the subject exists
	var subject models.Subject
	if err := config.DB.First(&subject, uint(subjectID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subject not found"})
		return
	}

	// Retrieve file from multipart form data
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	// Generate a unique filename using Unix nano timestamp to prevent collision
	uniqueFilename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
	uploadPath := filepath.Join("./uploads", uniqueFilename)

	// Save the physical file on the server
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save physical file"})
		return
	}

	// Save the Material record to the database
	material := models.Material{
		Title:     title,
		FilePath:  "/uploads/" + uniqueFilename,
		SubjectID: uint(subjectID),
	}

	if err := config.DB.Create(&material).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create material record in database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Material uploaded successfully",
		"material": material,
	})
}

// CreateQuiz allows a teacher to create a new quiz bound to a subject
func CreateQuiz(c *gin.Context) {
	var input CreateQuizInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify that the subject exists
	var subject models.Subject
	if err := config.DB.First(&subject, input.SubjectID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subject not found"})
		return
	}

	quiz := models.Quiz{
		Title:     input.Title,
		Duration:  input.Duration,
		SubjectID: input.SubjectID,
	}

	if err := config.DB.Create(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create quiz"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Quiz created successfully",
		"quiz":    quiz,
	})
}
