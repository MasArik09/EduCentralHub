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

		// New modular Teacher Actions
		teacherGroup.GET("/classes", controllers.GetClasses)
		teacherGroup.GET("/materials", controllers.GetTeacherMaterials)
		teacherGroup.POST("/materials", controllers.CreateTeacherMaterial)
		teacherGroup.DELETE("/materials/:id", controllers.DeleteTeacherMaterial)

		teacherGroup.GET("/quizzes", controllers.GetTeacherQuizzes)
		teacherGroup.POST("/quizzes", controllers.CreateTeacherQuiz)
		teacherGroup.DELETE("/quizzes/:id", controllers.DeleteTeacherQuiz)
	}
}
