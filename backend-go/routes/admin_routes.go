package routes

import (
	"EduCentralHub/controllers"
	"EduCentralHub/middleware"

	"github.com/gin-gonic/gin"
)

// AdminRoutes sets up the administration endpoints with admin-role protection.
func AdminRoutes(router *gin.Engine) {
	adminGroup := router.Group("/api/admin")
	// Protect all routes in this group using AuthMiddleware with the "admin" role
	adminGroup.Use(middleware.AuthMiddleware("admin"))
	{
		adminGroup.POST("/class", controllers.CreateClass)
		adminGroup.POST("/enroll", controllers.EnrollStudent)
	}
}
