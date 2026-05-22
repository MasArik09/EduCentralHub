package routes

import (
	"EduCentralHub/controllers"

	"github.com/gin-gonic/gin"
)

// SetupAuthRoutes registers the authentication endpoints in the Gin engine.
func SetupAuthRoutes(r *gin.Engine) {
	authGroup := r.Group("/api/auth")
	{
		authGroup.POST("/register", controllers.Register)
		authGroup.POST("/login", controllers.Login)
	}
}
