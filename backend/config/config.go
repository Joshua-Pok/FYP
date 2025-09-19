package config

import "os"

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

type ServerConfig struct {
	Port string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	DBURL    string
}

func Load() *Config {
	cfg := &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
		},

		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "joshua"),
			Password: getEnv("DB_PASSWORD", "joshua"),
			DBName:   getEnv("DB_NAME", "postgres"),
		},
	}

	cfg.Database.DBURL = " host=" + cfg.Database.Host + " port=" + cfg.Database.Port + " user=" + cfg.Database.User + " password=" + cfg.Database.Password + " dbname=" + cfg.Database.DBName + " sslmode=disable"

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
