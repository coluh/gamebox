package main

import (
	"gamebox/server/internal/auth"
	"gamebox/server/internal/config"
	"gamebox/server/internal/db"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	cfg := config.Load()

	db, err := db.Connect(cfg.Database.DSN)
	if err != nil {
		log.Fatal(err)
	}

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
	api.POST("/guest", authHandler.Guest)
	api.POST("/login", authHandler.Login)
	authGroup := api.Group("/auth")
	authGroup.Use(auth.Middleware([]byte(cfg.JWTSecret)))
	{
		authGroup.GET("/me", authHandler.Me)
		authGroup.POST("/register", authHandler.Register)
	}

	r.Run(":" + cfg.Port)
}
