package service

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type CacheService struct {
	Client *redis.Client
	Ctx    context.Context
}

func NewCacheService(addr, password string, db int) *CacheService {
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	return &CacheService{
		Client: rdb,
		Ctx:    context.Background(),
	}
}

func (c *CacheService) Set(key string, value []byte, ttl time.Duration) error {
	return c.Client.Set(c.Ctx, key, value, ttl).Err()
}

func (c *CacheService) Get(key string) ([]byte, error) {
	return c.Client.Get(c.Ctx, key).Bytes()
}
