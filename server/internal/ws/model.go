package ws

import "encoding/json"

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

type JoinResponse struct {
	RoomID string `json:"roomId"`
	Count  int    `json:"count"`
}

type Game interface {
	Join(id string)
	Leave(id string)
	Handle(id, typ string, payload []byte)
	Update()
}

type GameMessage struct {
	ID      string          `json:"id"`
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}
