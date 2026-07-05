package ws

import (
	"gamebox/server/internal/auth"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WsHandler(hub *Hub, jwtSecret []byte, repo *auth.Repository) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := ctx.Query("token")
		if token == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{
				Error:   "unauthorized",
				Message: "缺少token",
			})
			return
		}

		userID, err := auth.ParseToken(token, jwtSecret)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{
				Error:   "unauthorized",
				Message: "token无效",
			})
			return
		}
		nickname, _ := repo.GetNicknameByID(userID)

		if _, ok := hub.clients[userID]; ok {
			log.Println("already logged in")
			return
		}

		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if err != nil {
			return
		}

		client := NewClient(conn, userID, nickname)
		hub.register <- client
		go client.readLoop(hub)
		go client.writeLoop()
	}
}
