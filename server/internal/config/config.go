package config

import "os"

type Config struct {
	Port      string
	JWTSecret string
	Database  DatabaseConfig
}

type DatabaseConfig struct {
	DSN string
}

func Load() *Config {
	return &Config{
		Port:      getEnv("PORT", "3600"),
		JWTSecret: getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		Database: DatabaseConfig{
			DSN: getEnv("DATABASE_URL", "postgres://gamebox:gamebox@localhost:5432/gamebox?sslmode=disable"),
		},
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
