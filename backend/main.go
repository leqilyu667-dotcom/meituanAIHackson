package main

import (
	"log"

	"github.com/miaoshou/backend/config"
	"github.com/miaoshou/backend/database"
	"github.com/miaoshou/backend/middleware"
	"github.com/miaoshou/backend/router"
	"github.com/miaoshou/backend/seed"
)

func main() {
	// Load config
	cfg := config.Load()

	// Set JWT secret for middleware
	middleware.SetJWTSecret(cfg.JWTSecret)

	// Initialize database
	database.Init(cfg.DBPath)

	// Seed demo data
	seed.Run()

	// Setup router
	r := router.Setup()

	// Start server
	log.Printf("妙手 Backend starting on :%s", cfg.Port)
	log.Printf("CORS origin: %s", cfg.CORSOrigin)
	log.Printf("Database: %s", cfg.DBPath)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
