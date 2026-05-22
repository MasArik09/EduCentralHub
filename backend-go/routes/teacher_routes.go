package routes

import (
	"EduCentralHub/controllers"
	"EduCentralHub/middleware"

	"github.com/gin-gonic/gin"
)

// TeacherRoutes sets up the teaching endpoints with teacher-role protection.
func TeacherRoutes(router *gin.Engine) {
	teacherGroup := router.Group("/api/teacher")
	// Protect all routes in this group using AuthMiddleware with the "teacher" role
	teacherGroup.Use(middleware.AuthMiddleware("teacher"))
	{
		teacherGroup.POST("/subject", controllers.CreateSubject)
		teacherGroup.POST("/subject/material", controllers.UploadMaterial)
		teacherGroup.POST("/quiz", controllers.CreateQuiz)
	}
}
