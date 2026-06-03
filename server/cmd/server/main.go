package main

import (
	"gamebox/server/internal/auth"
	"gamebox/server/internal/config"
	"gamebox/server/internal/database"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	cfg := config.Load()

	db, err := database.Connect(cfg.Database.DSN)
	if err != nil {
		log.Fatal(err)
	}
	database.InitRedis(cfg.Redis.Addr)

	authRepo := auth.NewRepository(db)
	authHandler := auth.NewHandler(auth.NewService(authRepo, cfg.JWTSecret))

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders: []string{"*"},
	}))

	r.GET("/health", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	api := r.Group("/api")
	{
		api.POST("/guest", authHandler.Guest)
		api.POST("/login", authHandler.Login)
		api.POST("/refresh", authHandler.Refresh)
	}
	apiAuth := r.Group("/api")
	apiAuth.Use(auth.Middleware([]byte(cfg.JWTSecret)))
	{
		apiAuth.GET("/me", authHandler.Me)
		apiAuth.POST("/bind", authHandler.Bind)
	}

	r.Run(":" + cfg.Port)
}
