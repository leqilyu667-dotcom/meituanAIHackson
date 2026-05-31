package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var JWTSecret string

func SetJWTSecret(secret string) {
	JWTSecret = secret
}

func CORSMiddleware(origin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "请先登录"})
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "登录已过期"})
			c.Abort()
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		c.Set("user_id", uint(claims["user_id"].(float64)))
		c.Set("role", claims["role"].(string))
		c.Next()
	}
}

func MerchantOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		if role != "merchant" && role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"code": 403, "message": "需要商家权限"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// OptionalAuth reads auth header if present but doesn't require it
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			c.Next()
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(JWTSecret), nil
		})
		if err == nil && token.Valid {
			claims := token.Claims.(jwt.MapClaims)
			c.Set("user_id", uint(claims["user_id"].(float64)))
			c.Set("role", claims["role"].(string))
		}
		c.Next()
	}
}
