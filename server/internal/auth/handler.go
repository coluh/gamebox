package auth

import (
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

// 创建或登录游客账号，返回7天token及用户信息
func (h *Handler) Guest(ctx *gin.Context) {
	var req GuestRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "validation_error", Message: "昵称格式不正确（1-30字符）"})
		return
	}

	user, token, err := h.svc.CreateGuest(req.Nickname)
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

	ctx.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  toUserResponse(user),
	})
}

// 获取自身用户信息
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
			ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "user_not_found", Message: "用户不存在或已被清理"})
		default:
			ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "internal_error", Message: "服务器内部错误"})
			log.Println("500:", err)
		}
		return
	}

	ctx.JSON(http.StatusOK, MeResponse{
		User: toUserResponse(user),
	})
}

// 绑定邮箱，升级为正式用户，返回新token
func (h *Handler) Register(ctx *gin.Context) {
	userID := ctx.GetString("user_id")
	if userID == "" {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "unauthorized", Message: "请先创建游客身份"})
		return
	}

	var req RegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "validation_error", Message: "邮箱或密码格式不正确"})
		return
	}

	user, token, err := h.svc.Register(userID, req.Email, req.Password)
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

	ctx.JSON(http.StatusOK, AuthResponse{
		Token: token, // 新token哦
		User:  toUserResponse(user),
	})
}

// 正式用户登录
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

	user, token, err := h.svc.Login(req)
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

	ctx.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  toUserResponse(user),
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
		IsGuest:   u.Email == nil,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
		ExpiresAt: expiresAt,
	}
}
