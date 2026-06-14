package ws

import (
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn   *websocket.Conn
	userID string
	send   chan []byte
}

func (c *Client) readLoop(h *Hub) {
	defer func() {
		h.unregister <- c
		c.conn.Close()
	}()

	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		log.Println("client says:", string(msg))
		h.broadcast <- msg
	}
}

func (c *Client) writeLoop() {
	defer c.conn.Close()

	for msg := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}
