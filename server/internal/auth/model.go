package auth

// POST /api/guest
type GuestRequest struct {
	Nickname string `json:"nickname" binding:"required,min=1,max=30"`
}

// POST /api/bind
type BindRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// POST /api/login
type LoginRequest struct {
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	Password string `json:"password" binding:"required,min=6"`
}

// POST /api/refresh
type RefreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type UserResponse struct {
	ID        string  `json:"id"`
	Nickname  string  `json:"nickname"`
	Email     *string `json:"email"`
	CreatedAt string  `json:"createdAt"`
	ExpiresAt *string `json:"expiresAt"`
}

// * POST /api/guest
// * POST /api/login
type AuthResponse struct {
	AccessToken  string       `json:"accessToken"`
	RefreshToken string       `json:"refreshToken"`
	User         UserResponse `json:"user"`
}

// * POST /api/refresh
type RefreshResponse struct {
	AccessToken string `json:"accessToken"`
}

// * POST /api/bind
// * GET /api/me
type MeResponse struct {
	User UserResponse `json:"user"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}
