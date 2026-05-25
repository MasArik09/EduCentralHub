package controllers

import (
	"encoding/csv"
	"io"
	"net/http"

	"EduCentralHub/config"
	"EduCentralHub/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Input struct for manual user creation
type CreateUserInput struct {
	Name     string `json:"name" binding:"required"`
	NIS      string `json:"nis"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
	WhatsApp string `json:"whatsapp"`
	Status   string `json:"status"`
}

// POST /api/admin/users
func CreateUser(c *gin.Context) {
	var input CreateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate role
	role := input.Role
	if role != "admin" && role != "teacher" && role != "student" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role must be admin, teacher, or student"})
		return
	}

	// Default status
	status := input.Status
	if status == "" {
		status = "aktif"
	}

	// Check if Email already exists
	var count int64
	config.DB.Model(&models.User{}).Where("email = ?", input.Email).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah terdaftar!"})
		return
	}

	// Check if NIS already exists (if provided)
	if input.NIS != "" {
		config.DB.Model(&models.User{}).Where("nis = ?", input.NIS).Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "NIS sudah terdaftar!"})
			return
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	wa := input.WhatsApp
	user := models.User{
		Name:     input.Name,
		NIS:      input.NIS,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     role,
		WhatsApp: &wa,
		Status:   status,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User berhasil dibuat!",
		"user":    user,
	})
}

// POST /api/admin/users/import
func ImportUsersBulk(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CSV file is required"})
		return
	}

	openedFile, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer openedFile.Close()

	reader := csv.NewReader(openedFile)
	// Read header row
	_, err = reader.Read()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read CSV header"})
		return
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var users []models.User
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read CSV row"})
			return
		}

		// CSV structure: name, nis, email, password, role, whatsapp
		if len(record) < 5 {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "CSV format must have at least 5 columns: name, nis, email, password, role, [whatsapp]"})
			return
		}

		name := record[0]
		nis := record[1]
		email := record[2]
		password := record[3]
		role := record[4]
		whatsapp := ""
		if len(record) > 5 {
			whatsapp = record[5]
		}

		if name == "" || email == "" || password == "" || role == "" {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Name, email, password, and role are required for all rows"})
			return
		}

		// Check duplicate email inside transaction
		var count int64
		if err := tx.Model(&models.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		if count > 0 {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email '" + email + "' sudah terdaftar!"})
			return
		}

		// Check duplicate NIS inside transaction
		if nis != "" {
			if err := tx.Model(&models.User{}).Where("nis = ?", nis).Count(&count).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
				return
			}
			if count > 0 {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"error": "NIS '" + nis + "' sudah terdaftar!"})
				return
			}
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		wa := whatsapp
		users = append(users, models.User{
			Name:     name,
			NIS:      nis,
			Email:    email,
			Password: string(hashedPassword),
			Role:     role,
			WhatsApp: &wa,
			Status:   "aktif",
		})
	}

	if len(users) == 0 {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "No records found in CSV file"})
		return
	}

	// Bulk insert
	if err := tx.Create(&users).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to bulk insert users: " + err.Error()})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Bulk import berhasil!",
		"count":   len(users),
	})
}
