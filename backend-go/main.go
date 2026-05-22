package main

import (
	"log"
	"net/http"

	"EduCentralHub/config"
	"EduCentralHub/models"
	"EduCentralHub/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Initialize connection to the database
	config.ConnectDatabase()

	// 2. Perform database auto-migration for all models
	log.Println("Running auto-migration...")
	err := config.DB.AutoMigrate(
		&models.User{},
		&models.Class{},
		&models.Subject{},
		&models.Enrollment{},
		&models.Material{},
		&models.Quiz{},
		&models.QuizAttempt{},
	)
	if err != nil {
		log.Fatalf("Failed to perform auto-migration: %v", err)
	}
	log.Println("Database migration completed successfully!")

	// 3. Initialize Gin engine router
	r := gin.Default()

	// Serve static files from uploads folder
	r.Static("/uploads", "./uploads")

	// Simple status/health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "EduCentralHub Go Backend",
		})
	})

	// 4. Register routes
	routes.SetupAuthRoutes(r)
	routes.AdminRoutes(r)
	routes.TeacherRoutes(r)
	routes.StudentRoutes(r)

	// 5. Run the web server on port 8080
	log.Println("Starting EduCentralHub backend on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
