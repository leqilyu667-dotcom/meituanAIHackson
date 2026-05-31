package database

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/miaoshou/backend/models"
)

var DB *gorm.DB

func Init(dbPath string) {
	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate all models
	err = DB.AutoMigrate(
		&models.User{},
		&models.Salon{},
		&models.ServiceItem{},
		&models.Artist{},
		&models.ArtistWork{},
		&models.Product{},
		&models.InspirationTheme{},
		&models.Reservation{},
		&models.Order{},
		&models.Review{},
		&models.Conversation{},
		&models.ChatMessage{},
		&models.Favorite{},
		&models.Coupon{},
		&models.TryonLog{},
	)
	if err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}

	log.Println("Database migrated successfully")
}
