package game

import "encoding/json"

type Vector struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
}

func (v Vector) dist2() float32 {
	return v.X*v.X + v.Y*v.Y
}

type MoveReq struct {
	Direction Vector `json:"dir"`
}

type TeleportReq struct {
	Position Vector `json:"pos"`
}

type Player struct {
	ID       string `json:"id"`
	Position Vector `json:"pos"`
	Velocity Vector `json:"vel"`
}

type PlayerSync struct {
	Players []Player `json:"list"`
}

type GameMessage struct {
	ID      string          `json:"id"`
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}
