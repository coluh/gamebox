package ws

import "log"

type Hub struct {
	clients    map[string]*Client
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			if old, ok := h.clients[client.userID]; ok {
				close(client.send)
				old.conn.Close()
			}
			h.clients[client.userID] = client
			log.Println("client joined")
		case client := <-h.unregister:
			if _, ok := h.clients[client.userID]; ok {
				log.Println("client left")
				delete(h.clients, client.userID)
				close(client.send)
			}
		case msg := <-h.broadcast:
			for _, client := range h.clients {
				select {
				case client.send <- msg:
				default:
				}
			}
		}
	}
}
