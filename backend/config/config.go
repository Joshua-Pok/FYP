package config

import (
	"log"
	"os"
	"strconv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	MinIO    MinIOConfig
	Gorse    GorseConfig
	Cache    CacheConfig
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

type MinIOConfig struct {
	Endpoint   string
	AccessKey  string
	Secret     string
	BucketName string
}

type GorseConfig struct {
	URL string
}

type CacheConfig struct {
	Addr     string
	Password string
	Db       int
}

func Load() *Config {
	dbNum, err := strconv.Atoi(getEnv("REDIS_DB", "0"))
	if err != nil {
		log.Fatalf("Invalid Redis DB value %v", err)
	}

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

		MinIO: MinIOConfig{
			Endpoint:   getEnv("MINIO_ENDPOINT", "localhost:9000"),
			AccessKey:  getEnv("MINIO_ACCESS_KEY", "minio"),
			Secret:     getEnv("MINIO_SECRET_KEY", ""),
			BucketName: getEnv("MINIO_BUCKET", "joshua"),
		},

		Gorse: GorseConfig{
			URL: getEnv("GORSE_URL", "localhost:8081"),
		},

		Cache: CacheConfig{
			Addr:     getEnv("REDIS_ADDR", "localhost:6432"),
			Password: getEnv("REDIS_PASSWORD", "localhost:6969"),
			Db:       dbNum,
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
