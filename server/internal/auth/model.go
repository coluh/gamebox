package auth

// POST /api/guest
type GuestRequest struct {
	Nickname string `json:"nickname" binding:"required,min=1,max=30"`
}

// POST /api/auth/register
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// POST /api/login
type LoginRequest struct {
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	Password string `json:"password" binding:"required,min=6"`
}

type UserResponse struct {
	ID        string  `json:"id"`
	Nickname  string  `json:"nickname"`
	Email     *string `json:"email"`
	IsGuest   bool    `json:"is_guest"`
	CreatedAt string  `json:"created_at"`
	ExpiresAt *string `json:"expires_at"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

type MeResponse struct {
	User UserResponse `json:"user"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}
