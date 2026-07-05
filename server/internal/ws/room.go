package ws

import (
	"context"
	"strconv"
	"time"

	"gamebox/server/internal/database"
	"gamebox/server/internal/game"
)

const MAX_ROOM_CLIENTS = 20

type Room struct {
	roomID   string
	clients  map[string]*Client // TODO: add lock
	joinCh   chan *Client
	leaveCh  chan *Client
	incoming chan GameMessage
	ticker   *time.Ticker
	game     Game
}

func NewRoom() (*Room, error) {
	roomID, err := database.Rdb.Incr(context.Background(), "room_id_seq").Result()
	if err != nil {
		return nil, err
	}
	room := &Room{
		roomID:   strconv.FormatInt(roomID, 10),
		clients:  make(map[string]*Client),
		joinCh:   make(chan *Client),
		leaveCh:  make(chan *Client),
		incoming: make(chan GameMessage),
	}
	room.game = game.NewGame(func(msg []byte) {
		room.broadcast(msg)
	})
	return room, nil
}

func (r *Room) Run() {
	r.ticker = time.NewTicker(50 * time.Millisecond)
	defer func() {
		r.ticker.Stop()
		close(r.incoming)
	}()

	for {
		select {
		case client := <-r.joinCh:
			r.clients[client.userID] = client
			client.room = r

			r.game.Join(client.userID)
		case client := <-r.leaveCh:
			if _, ok := r.clients[client.userID]; ok {
				delete(r.clients, client.userID)
				client.room = nil

				r.game.Leave(client.userID)
			}
		case msg := <-r.incoming:
			r.game.Handle(msg.ID, msg.Type, msg.Payload)
		case <-r.ticker.C:
			r.game.Update()
		}

	}
}

func (r *Room) broadcast(msg []byte) {
	for _, client := range r.clients {
		if client.dead.Load() {
			continue
		}
		select {
		case client.send <- msg:
		default:
		}
	}
}
