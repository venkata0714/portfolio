package controllers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

// VerifyJWT is a Gin middleware that checks for a valid JWT in the "token" cookie.
func VerifyJWT(c *gin.Context) {
	tokenStr, err := c.Cookie("token")
	if err != nil || tokenStr == "" {
		// No token cookie present
		c.JSON(http.StatusUnauthorized, gin.H{"message": "No token provided"})
		c.Abort()
		return
	}
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Secret must be provided in environment
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server JWT secret not configured"})
		c.Abort()
		return
	}
	// Parse and validate token
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		// Ensure token method is HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		c.JSON(http.StatusForbidden, gin.H{"message": "Failed to authenticate token"})
		c.Abort()
		return
	}
	// Attach token claims to context (if needed)
	var claims jwt.MapClaims
	if mp, ok := token.Claims.(jwt.MapClaims); ok {
		claims = mp
	}
	// For convenience, set "user" (e.g., "admin") if present in claims
	if claims != nil {
		if user, ok := claims["user"]; ok {
			c.Set("user", user)
		} else {
			c.Set("user", claims)
		}
	}
	c.Next()
}

// HashPassword and Compare functions could be implemented if needed for admin credentials handling.
// (Using bcrypt in Node; in Go, could use golang.org/x/crypto/bcrypt if needed.)
