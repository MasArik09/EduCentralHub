package controllers

import (
	"net/http"

	"EduCentralHub/config"
	"EduCentralHub/models"

	"github.com/gin-gonic/gin"
)

// CreateClassInput defines the payload for creating a new class
type CreateClassInput struct {
	ClassName string `json:"class_name" binding:"required"`
}

// EnrollStudentInput defines the payload for enrolling a student into a class
type EnrollStudentInput struct {
	StudentID uint `json:"student_id" binding:"required"`
	ClassID   uint `json:"class_id" binding:"required"`
}

// CreateClass handles the creation of a new Class record by an Admin
func CreateClass(c *gin.Context) {
	var input CreateClassInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	class := models.Class{
		ClassName: input.ClassName,
	}

	if err := config.DB.Create(&class).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create class"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Class created successfully",
		"class":   class,
	})
}

// EnrollStudent registers a student to a class by creating an Enrollment record
func EnrollStudent(c *gin.Context) {
	var input EnrollStudentInput
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

	// Verify that the student exists and is indeed a student
	var student models.User
	if err := config.DB.First(&student, input.StudentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}
	if student.Role != "student" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Selected user is not a student"})
		return
	}

	// Verify if the student is already enrolled in this class
	var existingEnrollment models.Enrollment
	err := config.DB.Where("student_id = ? AND class_id = ?", input.StudentID, input.ClassID).First(&existingEnrollment).Error
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Student is already enrolled in this class"})
		return
	}

	enrollment := models.Enrollment{
		StudentID: input.StudentID,
		ClassID:   input.ClassID,
	}

	if err := config.DB.Create(&enrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enroll student"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Student enrolled successfully",
		"enrollment": enrollment,
	})
}
