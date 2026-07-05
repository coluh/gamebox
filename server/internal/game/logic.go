package game

import (
	"encoding/json"
	"math"
)

type Game struct {
	players       map[string]*Player
	broadcastFunc func(msg []byte)
}

func NewGame(broadcastFunc func(msg []byte)) *Game {
	return &Game{
		players:       make(map[string]*Player),
		broadcastFunc: broadcastFunc,
	}
}

func (g *Game) Join(id string) {
	g.players[id] = &Player{ID: id, Position: Vector{X: 70, Y: 70}}
}

func (g *Game) Leave(id string) {
	delete(g.players, id)
}

func (g *Game) Handle(id, typ string, payload []byte) {
	player := g.players[id]

	switch typ {
	case "teleport":
		var t TeleportReq
		if err := json.Unmarshal(payload, &t); err != nil {
			return
		}
		player.Position.X = t.Position.X
		player.Position.Y = t.Position.Y
	case "move":
		var m MoveReq
		if err := json.Unmarshal(payload, &m); err != nil {
			return
		}
		dist := math.Sqrt(float64(m.Direction.dist2()))
		player.Velocity.X = m.Direction.X / float32(dist)
		player.Velocity.Y = m.Direction.Y / float32(dist)
	}
}

func (g *Game) Update() {
	for _, p := range g.players {
		p.Position.X += 0.05 * p.Velocity.X
		p.Position.Y += 0.05 * p.Velocity.Y
	}

	players := []Player{}
	for _, p := range g.players {
		players = append(players, *p)
	}
	payload, _ := json.Marshal(PlayerSync{Players: players})
	msg, _ := json.Marshal(GameMessage{Type: "sync", Payload: payload})
	g.broadcastFunc(msg)
}
