package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("educentral_secret")

// AuthMiddleware verifies the JWT token from the Authorization header
// and ensures the user's role matches the requiredRole parameter.
func AuthMiddleware(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// Check for Bearer token format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header must be in the format 'Bearer <token>'"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return jwtSecret, nil
		})

		if err != nil {
			if strings.Contains(err.Error(), "token is expired") || strings.Contains(err.Error(), "expired") {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "token expired"})
				c.Abort()
				return
			}
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Extract and verify claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		role, ok := claims["role"].(string)
		if !ok || role != requiredRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access forbidden: insufficient permissions"})
			c.Abort()
			return
		}

		// Store user data in Gin context for potential downstream handler usage
		c.Set("userID", claims["user_id"])
		c.Set("email", claims["email"])
		c.Set("role", role)

		c.Next()
	}
}
