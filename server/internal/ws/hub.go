package ws

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Hub struct {
	clients    map[string]*Client
	register   chan *Client
	unregister chan *Client
	rooms      map[string]*Room
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		rooms:      make(map[string]*Room),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client.userID] = client
			log.Println("client connected")
		case client := <-h.unregister:
			if _, ok := h.clients[client.userID]; ok {
				delete(h.clients, client.userID)
				if client.room != nil {
					client.room.leaveCh <- client
				}
				client.dead.Store(true)
				close(client.send)
				log.Println("client disconnected")
			}
		}
	}
}

func (h *Hub) JoinRoom(ctx *gin.Context) {
	userID := ctx.GetString("user_id")
	client := h.clients[userID]

	var targetRoom *Room
	for _, room := range h.rooms {
		if len(room.clients) < MAX_ROOM_CLIENTS {
			targetRoom = room
			break
		}
	}

	if targetRoom == nil {
		room, err := NewRoom()
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "internal_error", Message: "服务器内部错误"})
			log.Println("500:", err)
			return
		}
		h.rooms[room.roomID] = room
		targetRoom = room
		go room.Run()
	}

	targetRoom.joinCh <- client

	ctx.JSON(http.StatusOK, JoinResponse{
		RoomID: targetRoom.roomID,
		Count:  len(targetRoom.clients),
	})
}

func (h *Hub) LeaveRoom(ctx *gin.Context) {
	userID := ctx.GetString("user_id")
	client := h.clients[userID]

	if client.room != nil {
		client.room.leaveCh <- client
	}

	ctx.Status(http.StatusNoContent)
}
