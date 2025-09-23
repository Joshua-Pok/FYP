package config

import "os"

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	MinIO    MinIOConfig
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

		MinIO: MinIOConfig{
			Endpoint:   getEnv("MINIO_ENDPOINT", "localhost:9000"),
			AccessKey:  getEnv("MINIO_ACCESS_KEY", "minio"),
			Secret:     getEnv("MINIO_SECRET_KEY", ""),
			BucketName: getEnv("MINIO_BUCKET", "joshua"),
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
