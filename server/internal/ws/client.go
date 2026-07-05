package ws

import (
	"sync/atomic"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn     *websocket.Conn
	userID   string
	nickname string
	room     *Room
	send     chan []byte
	dead     atomic.Bool
}

func NewClient(conn *websocket.Conn, userID, nickname string) *Client {
	return &Client{
		conn:     conn,
		userID:   userID,
		nickname: nickname,
		send:     make(chan []byte),
	}
}

func (c *Client) readLoop(h *Hub) {
	defer func() {
		c.conn.Close()
		h.unregister <- c
	}()

	for {
		var gm GameMessage
		err := c.conn.ReadJSON(&gm)
		if err != nil {
			break
		}
		gm.ID = c.userID

		if c.room != nil {
			c.room.incoming <- gm
		}
	}
}

func (c *Client) writeLoop() {
	for msg := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}
