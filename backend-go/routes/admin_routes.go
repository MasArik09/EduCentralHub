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
		adminGroup.POST("/enroll-bulk", controllers.BulkEnrollStudents)
		adminGroup.GET("/students", controllers.GetAllStudents)
		adminGroup.GET("/available-students", controllers.GetAvailableStudents)
		adminGroup.GET("/classes", controllers.GetClasses)
		adminGroup.DELETE("/class/:id", controllers.DeleteClass)
		adminGroup.GET("/class/:id", controllers.GetClassDetail)
		adminGroup.POST("/class/bulk-remove", controllers.BulkRemoveClassMembers)
		adminGroup.POST("/class/bulk-move", controllers.BulkMoveClassMembers)

		// New User Management endpoints
		adminGroup.POST("/users", controllers.CreateUser)
		adminGroup.POST("/users/import", controllers.ImportUsersBulk)

		// Calendar Academic endpoints
		adminGroup.GET("/calendar-events", controllers.GetAllCalendarEvents)
		adminGroup.POST("/calendar-events", controllers.CreateCalendarEvent)
	}
}
