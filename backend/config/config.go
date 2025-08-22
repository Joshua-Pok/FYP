package config

import "os"

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

type ServerConfig struct {
	port string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			port: getEnv("PORT", "8080"),
		},

		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "joshua"),
			Password: getEnv("DB_PASSWORD", "joshua"),
			DBName:   getEnv("DB_NAME", "postgres"),
		},

		func getEnv(key, defaultValue string) string{
			if value := os.Getenv(key); value != ""{
				return value
			}
			return defaultValue
		}
	}
}
