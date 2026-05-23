package controllers

import (
	"fmt"
	"net/http"

	"EduCentralHub/config"
	"EduCentralHub/models"

	"github.com/gin-gonic/gin"
)

// CreateClassInput defines the payload for creating a new class
type CreateClassInput struct {
	ClassName   string `json:"class_name" binding:"required"`
	MaxStudents *int   `json:"max_students"`
	MaxTeachers *int   `json:"max_teachers"`
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

	maxStudents := 36
	if input.MaxStudents != nil && *input.MaxStudents > 0 {
		maxStudents = *input.MaxStudents
	}

	maxTeachers := 2
	if input.MaxTeachers != nil && *input.MaxTeachers > 0 {
		maxTeachers = *input.MaxTeachers
	}

	class := models.Class{
		ClassName:   input.ClassName,
		MaxStudents: maxStudents,
		MaxTeachers: maxTeachers,
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

	// Count existing students in the class
	var currentStudentsCount int64
	if err := config.DB.Model(&models.Enrollment{}).Where("class_id = ?", input.ClassID).Count(&currentStudentsCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check class capacity"})
		return
	}

	if class.MaxStudents > 0 && currentStudentsCount >= int64(class.MaxStudents) {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Gagal! Kapasitas kelas sudah penuh. Maksimal hanya muat %d siswa.", class.MaxStudents)})
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

// GetStudents retrieves all users whose role is "student"
func GetStudents(c *gin.Context) {
	var users []models.User
	if err := config.DB.Where("role = ?", "student").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}
	c.JSON(http.StatusOK, users)
}

// GetClasses retrieves all class records from the database
func GetClasses(c *gin.Context) {
	var classes []models.Class
	if err := config.DB.Find(&classes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch classes"})
		return
	}
	c.JSON(http.StatusOK, classes)
}

// DeleteClass deletes a class record by its ID
func DeleteClass(c *gin.Context) {
	id := c.Param("id")

	// Verify that the class exists
	var class models.Class
	if err := config.DB.First(&class, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	// Delete the class record
	if err := config.DB.Delete(&models.Class{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete class"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Class deleted successfully",
	})
}

// GetClassDetail retrieves a class's details including registered students and teachers
func GetClassDetail(c *gin.Context) {
	id := c.Param("id")

	// Verify that the class exists
	var class models.Class
	if err := config.DB.First(&class, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	// Fetch students enrolled in this class
	var students []models.User
	if err := config.DB.Where("id IN (SELECT student_id FROM enrollments WHERE class_id = ?)", id).
		Where("role = ?", "student").
		Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch enrolled students"})
		return
	}

	// Fetch teachers teaching in this class
	var teachers []models.User
	if err := config.DB.Where("id IN (SELECT teacher_id FROM subjects WHERE class_id = ?)", id).
		Where("role = ?", "teacher").
		Find(&teachers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch class teachers"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"class":    class,
		"students": students,
		"teachers": teachers,
	})
}

// BulkRemoveClassMembersInput defines the JSON payload for removing multiple students from a class
type BulkRemoveClassMembersInput struct {
	UserIDs []uint `json:"user_ids" binding:"required"`
	ClassID uint   `json:"class_id" binding:"required"`
}

// BulkMoveClassMembersInput defines the JSON payload for moving multiple students to a new class
type BulkMoveClassMembersInput struct {
	UserIDs     []uint `json:"user_ids" binding:"required"`
	FromClassID uint   `json:"from_class_id" binding:"required"`
	ToClassID   uint   `json:"to_class_id" binding:"required"`
}

// BulkRemoveClassMembers removes multiple students from a class
func BulkRemoveClassMembers(c *gin.Context) {
	var input BulkRemoveClassMembersInput
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

	// Remove enrollments
	if err := config.DB.Where("class_id = ? AND student_id IN ?", input.ClassID, input.UserIDs).Delete(&models.Enrollment{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove class members"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Class members removed successfully",
	})
}

// BulkMoveClassMembers moves multiple students from one class to another
func BulkMoveClassMembers(c *gin.Context) {
	var input BulkMoveClassMembersInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify both from and to classes exist
	var fromClass models.Class
	if err := config.DB.First(&fromClass, input.FromClassID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Source class not found"})
		return
	}

	var toClass models.Class
	if err := config.DB.First(&toClass, input.ToClassID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Destination class not found"})
		return
	}

	// Count existing students in the destination class
	var currentStudentsCount int64
	if err := config.DB.Model(&models.Enrollment{}).Where("class_id = ?", input.ToClassID).Count(&currentStudentsCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check destination class capacity"})
		return
	}

	// Calculate how many students are actually being moved from class
	var studentsToMoveCount int64
	if err := config.DB.Model(&models.Enrollment{}).
		Where("class_id = ? AND student_id IN ?", input.FromClassID, input.UserIDs).
		Count(&studentsToMoveCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count students to move"})
		return
	}

	if toClass.MaxStudents > 0 && currentStudentsCount + studentsToMoveCount > int64(toClass.MaxStudents) {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Gagal! Kapasitas kelas sudah penuh. Maksimal hanya muat %d siswa.", toClass.MaxStudents)})
		return
	}

	// Move enrollments
	if err := config.DB.Model(&models.Enrollment{}).
		Where("class_id = ? AND student_id IN ?", input.FromClassID, input.UserIDs).
		Update("class_id", input.ToClassID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to move class members"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Class members moved successfully",
	})
}
