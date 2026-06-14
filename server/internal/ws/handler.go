package ws

import (
	"gamebox/server/internal/auth"
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

func WsHandler(hub *Hub, jwtSecret []byte) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := ctx.Query("token")
		if token == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{
				Error:   "unauthorized",
				Message: "缺少token",
			})
		}

		userID, err := auth.ParseToken(token, jwtSecret)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{
				Error:   "unauthorized",
				Message: "token无效",
			})
		}

		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if err != nil {
			return
		}

		client := &Client{
			conn:   conn,
			userID: userID,
			send:   make(chan []byte),
		}
		hub.register <- client
		go client.readLoop(hub)
		go client.writeLoop()
	}
}
