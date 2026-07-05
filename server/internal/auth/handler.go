package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"gamebox/server/internal/database"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Guest(ctx *gin.Context) {
	var req GuestRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "validation_error", Message: "昵称格式不正确（1-30字符）"})
		return
	}

	user, accessToken, refreshToken, err := h.svc.CreateOrReuseGuest(req.Nickname)
	if err != nil {
		switch err {
		case ErrNicknameRegistered:
			ctx.JSON(http.StatusConflict, ErrorResponse{Error: "nickname_registered", Message: "账号已注册，输入密码登录"})
		default:
			ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "internal_error", Message: "服务器内部错误"})
			log.Println("500:", err)
		}
		return
	}

	hash := sha256.Sum256([]byte(refreshToken))
	database.Rdb.Set(ctx.Request.Context(), "refresh:"+user.ID, hex.EncodeToString(hash[:]), 7*24*time.Hour)

	ctx.JSON(http.StatusOK, AuthResponse{
		AccessToken: accessToken,
		User:        toUserResponse(user),
	})
}

func (h *Handler) Me(ctx *gin.Context) {
	userID := ctx.GetString("user_id")
	if userID == "" {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized", Message: "登录已过期，请重新进入"})
		return
	}

	user, err := h.svc.FindUserByID(userID)
	if err != nil {
		switch err {
		case ErrUserNotFound:
			ctx.JSON(http.StatusNotFound, ErrorResponse{Error: "user_not_found", Message: "用户不存在或已被清理"})
		default:
			ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "internal_error", Message: "服务器内部错误"})
			log.Println("500:", err)
		}
		return
	}

	ctx.JSON(http.StatusOK, toUserResponse(user))
}

func (h *Handler) Bind(ctx *gin.Context) {
	userID := ctx.GetString("user_id")
	if userID == "" {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized", Message: "请先创建游客身份"})
		return
	}

	var req BindRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "validation_error", Message: "邮箱或密码格式不正确"})
		return
	}

	user, err := h.svc.Bind(userID, req.Email, req.Password)
	if err != nil {
		switch err {
		case ErrNotGuest:
			ctx.JSON(http.StatusConflict, ErrorResponse{Error: "already_registered", Message: "该账号已绑定邮箱"})
		case ErrEmailTaken:
			ctx.JSON(http.StatusConflict, ErrorResponse{Error: "email_taken", Message: "该邮箱已被绑定"})
		default:
			ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "internal_error", Message: "服务器内部错误"})
			log.Println("500:", err)
		}
		return
	}

	ctx.JSON(http.StatusOK, toUserResponse(user))
}

func (h *Handler) Login(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "validation_error", Message: "请输入邮箱/昵称和密码"})
		return
	}

	if req.Email == "" && req.Nickname == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "validation_error", Message: "请提供邮箱或昵称"})
		return
	}

	user, accessToken, refreshToken, err := h.svc.Login(req)
	if err != nil {
		switch err {
		case ErrUserNotFound:
			ctx.JSON(http.StatusNotFound, ErrorResponse{Error: "user_not_found", Message: "该账号不存在"})
		case ErrInvalidPassword:
			ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "invalid_credentials", Message: "密码错误"})
		default:
			ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "internal_error", Message: "服务器内部错误"})
			log.Println("500:", err)
		}
		return
	}

	hash := sha256.Sum256([]byte(refreshToken))
	database.Rdb.Set(ctx.Request.Context(), "refresh:"+user.ID, hex.EncodeToString(hash[:]), 7*24*time.Hour)

	ctx.JSON(http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         toUserResponse(user),
	})
}

func (h *Handler) Refresh(ctx *gin.Context) {
	var req RefreshRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "validation_error", Message: "请求格式错误"})
		return
	}

	userID, err := database.Rdb.Get(ctx.Request.Context(), "refresh:"+req.RefreshToken).Result()
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized", Message: "refresh token无效或已过期"})
		return
	}

	accessToken, err := GenerateAccessToken(userID, h.svc.jwtSecret)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "internal_error", Message: "服务器内部错误"})
		log.Println("500:", err)
		return
	}

	ctx.JSON(http.StatusOK, RefreshResponse{
		AccessToken: accessToken,
	})
}

func toUserResponse(u *User) UserResponse {
	var expiresAt *string
	if u.ExpiresAt != nil {
		s := u.ExpiresAt.Format(time.RFC3339)
		expiresAt = &s
	}
	return UserResponse{
		ID:        u.ID,
		Nickname:  u.Nickname,
		Email:     u.Email,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
		ExpiresAt: expiresAt,
	}
}
