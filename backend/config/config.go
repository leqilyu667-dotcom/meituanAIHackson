package config

import "os"

type Config struct {
	Port      string
	DBPath    string
	JWTSecret string
	CORSOrigin string
}

func Load() *Config {
	return &Config{
		Port:       getEnv("PORT", "8080"),
		DBPath:     getEnv("DB_PATH", "./miaoshou.db"),
		JWTSecret:  getEnv("JWT_SECRET", "miaoshou-dev-secret-key-2026"),
		CORSOrigin: getEnv("CORS_ORIGIN", "http://localhost:5173"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
