#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up Go development environment...${NC}"

# Create project structure
echo -e "${YELLOW}📁 Creating project structure...${NC}"
mkdir -p {cmd,internal/{handlers,models,database,cache},sql,configs}

# Create basic Go files
cat > go.mod << EOF
module myapp

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/go-redis/redis/v8 v8.11.5
    github.com/lib/pq v1.10.9
    github.com/joho/godotenv v1.4.0
)
EOF

cat > main.go << 'EOF'
package main

import (
    "log"
    "myapp/internal/database"
    "myapp/internal/cache"
    "myapp/internal/handlers"
    
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    // Initialize database
    db, err := database.Connect()
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    defer db.Close()

    // Initialize Redis
    rdb := cache.Connect()
    defer rdb.Close()

    // Setup routes
    r := gin.Default()
    handlers.SetupRoutes(r, db, rdb)

    log.Println("Server starting on :8080")
    r.Run(":8080")
}
EOF

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USER=dev
DB_PASSWORD=devpass
DB_NAME=myapp
REDIS_HOST=localhost
REDIS_PORT=6379
ENV=development
EOF

# Create database connection
cat > internal/database/database.go << 'EOF'
package database

import (
    "database/sql"
    "fmt"
    "os"
    _ "github.com/lib/pq"
)

func Connect() (*sql.DB, error) {
    host := os.Getenv("DB_HOST")
    port := os.Getenv("DB_PORT")
    user := os.Getenv("DB_USER")
    password := os.Getenv("DB_PASSWORD")
    dbname := os.Getenv("DB_NAME")

    psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname)

    db, err := sql.Open("postgres", psqlInfo)
    if err != nil {
        return nil, err
    }

    if err = db.Ping(); err != nil {
        return nil, err
    }

    return db, nil
}
EOF

# Create Redis connection
cat > internal/cache/redis.go << 'EOF'
package cache

import (
    "context"
    "os"
    "github.com/go-redis/redis/v8"
)

func Connect() *redis.Client {
    host := os.Getenv("REDIS_HOST")
    port := os.Getenv("REDIS_PORT")
    
    rdb := redis.NewClient(&redis.Options{
        Addr: host + ":" + port,
        Password: "", // no password
        DB: 0,  // default DB
    })

    // Test connection
    _, err := rdb.Ping(context.Background()).Result()
    if err != nil {
        panic("Failed to connect to Redis: " + err.Error())
    }

    return rdb
}
EOF

# Create basic handlers
cat > internal/handlers/handlers.go << 'EOF'
package handlers

import (
    "database/sql"
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/go-redis/redis/v8"
)

func SetupRoutes(r *gin.Engine, db *sql.DB, rdb *redis.Client) {
    r.GET("/health", healthCheck)
    r.GET("/ping", pingHandler(rdb))
    
    api := r.Group("/api/v1")
    {
        api.GET("/users", getUsers(db))
        // Add more routes here
    }
}

func healthCheck(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "status": "ok",
        "message": "Server is running",
    })
}

func pingHandler(rdb *redis.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        pong, err := rdb.Ping(c.Request.Context()).Result()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        c.JSON(http.StatusOK, gin.H{"redis": pong})
    }
}

func getUsers(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Users endpoint",
            "data": []string{"user1", "user2"},
        })
    }
}
EOF

# Create init SQL
cat > sql/init.sql << 'EOF'
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (email, name) VALUES 
    ('john@example.com', 'John Doe'),
    ('jane@example.com', 'Jane Smith')
ON CONFLICT (email) DO NOTHING;
EOF

# Create .gitignore
cat > .gitignore << EOF
# Binaries
*.exe
*.exe~
*.dll
*.so
*.dylib
main

# Test binary
*.test

# Output of the go coverage tool
*.out

# Environment variables
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Docker
docker-compose.override.yml
EOF

echo -e "${GREEN}✅ Project structure created!${NC}"
echo -e "${YELLOW}📦 Starting Docker services...${NC}"

# Start Docker services
docker-compose up -d postgres redis

echo -e "${GREEN}🎉 Development environment ready!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run: go mod tidy"
echo "2. Run: go run main.go"
echo "3. Test: curl http://localhost:8080/health"
echo ""
echo -e "${YELLOW}Tmux workflow:${NC}"
echo "tmux new -s dev"
echo "# Window 0: Code editor"
echo "# Window 1: Go server (Ctrl+b c, then: go run main.go)"  
echo "# Window 2: Docker logs (Ctrl+b c, then: docker-compose logs -f)"
echo "# Window 3: Database client (Ctrl+b c, then: psql -h localhost -U dev -d myapp)"
