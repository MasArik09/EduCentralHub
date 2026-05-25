package controllers

import (
	"net/http"
	"strconv"

	"EduCentralHub/config"
	"EduCentralHub/models"

	"github.com/gin-gonic/gin"
)

// Helper to get logged-in teacher ID from context
func getTeacherID(c *gin.Context) (uint, bool) {
	val, exists := c.Get("userID")
	if !exists {
		return 0, false
	}
	switch v := val.(type) {
	case float64:
		return uint(v), true
	case int:
		return uint(v), true
	case uint:
		return v, true
	}
	return 0, false
}

// GET /api/teacher/materials
func GetTeacherMaterials(c *gin.Context) {
	teacherID, ok := getTeacherID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var materials []models.Material
	if err := config.DB.Preload("Class").Where("teacher_id = ?", teacherID).Order("id desc").Find(&materials).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch materials"})
		return
	}

	c.JSON(http.StatusOK, materials)
}

// POST /api/teacher/materials
func CreateTeacherMaterial(c *gin.Context) {
	teacherID, ok := getTeacherID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		FileURL     string `json:"file_url" binding:"required"`
		ClassID     uint   `json:"class_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify class exists
	var class models.Class
	if err := config.DB.First(&class, input.ClassID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	material := models.Material{
		Title:       input.Title,
		Description: input.Description,
		FileURL:     input.FileURL,
		ClassID:     input.ClassID,
		TeacherID:   teacherID,
	}

	if err := config.DB.Create(&material).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create material"})
		return
	}

	// Preload Class for response
	config.DB.Preload("Class").First(&material, material.ID)

	c.JSON(http.StatusCreated, material)
}

// DELETE /api/teacher/materials/:id
func DeleteTeacherMaterial(c *gin.Context) {
	teacherID, ok := getTeacherID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var material models.Material
	if err := config.DB.Where("id = ? AND teacher_id = ?", uint(id), teacherID).First(&material).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Material not found or access denied"})
		return
	}

	if err := config.DB.Delete(&material).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete material"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Material deleted successfully"})
}

// GET /api/teacher/quizzes
func GetTeacherQuizzes(c *gin.Context) {
	teacherID, ok := getTeacherID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var quizzes []models.Quiz
	if err := config.DB.Preload("Class").Where("teacher_id = ?", teacherID).Order("id desc").Find(&quizzes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch quizzes"})
		return
	}

	c.JSON(http.StatusOK, quizzes)
}

// POST /api/teacher/quizzes
func CreateTeacherQuiz(c *gin.Context) {
	teacherID, ok := getTeacherID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Title     string `json:"title" binding:"required"`
		Duration  int    `json:"duration" binding:"required"`
		ClassID   uint   `json:"class_id" binding:"required"`
		Questions string `json:"questions"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify class exists
	var class models.Class
	if err := config.DB.First(&class, input.ClassID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	quiz := models.Quiz{
		Title:     input.Title,
		Duration:  input.Duration,
		ClassID:   input.ClassID,
		TeacherID: teacherID,
		Questions: input.Questions,
	}

	if err := config.DB.Create(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create quiz"})
		return
	}

	// Preload Class for response
	config.DB.Preload("Class").First(&quiz, quiz.ID)

	c.JSON(http.StatusCreated, quiz)
}

// DELETE /api/teacher/quizzes/:id
func DeleteTeacherQuiz(c *gin.Context) {
	teacherID, ok := getTeacherID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var quiz models.Quiz
	if err := config.DB.Where("id = ? AND teacher_id = ?", uint(id), teacherID).First(&quiz).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Quiz not found or access denied"})
		return
	}

	if err := config.DB.Delete(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete quiz"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Quiz deleted successfully"})
}
