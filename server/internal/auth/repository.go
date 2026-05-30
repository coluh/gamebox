package auth

import (
	"database/sql"
	"time"
)

type User struct {
	ID           string
	Nickname     string
	Email        *string
	PasswordHash *string
	CreatedAt    time.Time
	ExpiresAt    *time.Time
}

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

// in: Nickname, Email, PasswordHash, ExpiresAt
// out: ID, CreatedAt
func (r *Repository) Create(u *User) error {
	return r.db.QueryRow(
		`INSERT INTO users (nickname, email, password_hash, expires_at)
		VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
		u.Nickname, u.Email, u.PasswordHash, u.ExpiresAt,
	).Scan(&u.ID, &u.CreatedAt)
}

func (r *Repository) FindByID(id string) (*User, error) {
	u := &User{}
	err := r.db.QueryRow(`
		SELECT id, nickname, email, password_hash, created_at, expires_at
		FROM users WHERE id = $1
		`, id).Scan(&u.ID, &u.Nickname, &u.Email, &u.PasswordHash, &u.CreatedAt, &u.ExpiresAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return u, err
}

func (r *Repository) FindByNickname(nickname string) (*User, error) {
	u := &User{}
	err := r.db.QueryRow(`
		SELECT id, nickname, email, password_hash, created_at, expires_at
		FROM users WHERE nickname = $1
		`, nickname).Scan(&u.ID, &u.Nickname, &u.Email, &u.PasswordHash, &u.CreatedAt, &u.ExpiresAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return u, err
}

func (r *Repository) FindByEmail(email string) (*User, error) {
	u := &User{}
	err := r.db.QueryRow(`
		SELECT id, nickname, email, password_hash, created_at, expires_at
		FROM users WHERE email = $1
		`, email).Scan(&u.ID, &u.Nickname, &u.Email, &u.PasswordHash, &u.CreatedAt, &u.ExpiresAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return u, err
}

func (r *Repository) Update(u *User) error {
	_, err := r.db.Exec(`
		UPDATE users SET nickname=$1, email=$2, password_hash=$3, expires_at=$4
		WHERE id=$5
		`, u.Nickname, u.Email, u.PasswordHash, u.ExpiresAt, u.ID)
	return err
}

func (r *Repository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM users WHERE id=$1`, id)
	return err
}
