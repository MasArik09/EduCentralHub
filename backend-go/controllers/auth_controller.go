package controllers

import (
	"net/http"
	"time"

	"EduCentralHub/config"
	"EduCentralHub/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// JWT secret key as requested
var jwtSecret = []byte("educentral_secret")

// RegisterInput defines the request body for user registration
type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role"`
}

// LoginInput defines the request body for user login
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register handles user registration (hashes password and saves user to DB)
func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password using bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Set default role if not provided
	role := input.Role
	if role == "" {
		role = "student"
	}

	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     role,
	}

	// Save user to the database
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// Login validates user credentials and returns an access_token (JWT, exp 1 hour) and a refresh_token (JWT, exp 7 days)
func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	// Find user by email
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Compare bcrypt password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// 1. Create Access JWT token with 1 hour duration
	accessExpirationTime := time.Now().Add(1 * time.Hour)
	accessClaims := &jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"type":    "access",
		"exp":     accessExpirationTime.Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate authentication token"})
		return
	}

	// 2. Create Refresh JWT token with 7 days duration
	refreshExpirationTime := time.Now().Add(7 * 24 * time.Hour)
	refreshClaims := &jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"type":    "refresh",
		"exp":     refreshExpirationTime.Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate refresh token"})
		return
	}

	// 3. Save refresh token in database
	user.RefreshToken = refreshTokenString
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successful",
		"token":         accessTokenString, // for backwards compatibility
		"access_token":  accessTokenString,
		"refresh_token": refreshTokenString,
		"expires":       accessExpirationTime.Format(time.RFC3339),
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// RefreshInput defines the request body for token refresh
type RefreshInput struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Refresh validates the refresh_token and returns a new access_token if valid
func Refresh(c *gin.Context) {
	var input RefreshInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse and validate the refresh token
	token, err := jwt.Parse(input.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	// Verify it is a refresh token
	tokType, ok := claims["type"].(string)
	if !ok || tokType != "refresh" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token is not a valid refresh token"})
		return
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID claim"})
		return
	}
	userID := uint(userIDFloat)

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Verify that token matches stored token
	if user.RefreshToken != input.RefreshToken {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token has been revoked or rotated"})
		return
	}

	// Generate a fresh access token (exp 1 hour)
	accessExpirationTime := time.Now().Add(1 * time.Hour)
	accessClaims := &jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"type":    "access",
		"exp":     accessExpirationTime.Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate authentication token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":        accessTokenString,
		"access_token": accessTokenString,
		"expires":      accessExpirationTime.Format(time.RFC3339),
	})
}
