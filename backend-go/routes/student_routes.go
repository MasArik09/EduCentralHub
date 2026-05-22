package routes

import (
	"EduCentralHub/controllers"
	"EduCentralHub/middleware"

	"github.com/gin-gonic/gin"
)

// StudentRoutes sets up the student endpoints with student-role protection.
func StudentRoutes(router *gin.Engine) {
	studentGroup := router.Group("/api/student")
	// Protect all routes in this group using AuthMiddleware with the "student" role
	studentGroup.Use(middleware.AuthMiddleware("student"))
	{
		studentGroup.POST("/quiz/submit", controllers.SubmitQuiz)
	}
}
