package auth

import (
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrNicknameRegistered = errors.New("账号已注册，请输入密码登录")
	ErrUserNotFound       = errors.New("用户不存在")
	ErrNotGuest           = errors.New("账号已经绑定邮箱")
	ErrEmailTaken         = errors.New("邮箱已被绑定")
	ErrInvalidPassword    = errors.New("密码错误")
)

type Service struct {
	repo      *Repository
	jwtSecret []byte
}

func NewService(repo *Repository, jwtSecret string) *Service {
	return &Service{
		repo:      repo,
		jwtSecret: []byte(jwtSecret),
	}
}

// create guest user
func (s *Service) CreateGuest(nickname string) (*User, string, error) {
	existing, err := s.repo.FindByNickname(nickname)
	if err != nil {
		return nil, "", err
	}
	if existing != nil {
		if existing.Email != nil {
			return nil, "", ErrNicknameRegistered
		}
		// guest with same nickname, just let him login, no verify
		if existing.ExpiresAt != nil && existing.ExpiresAt.After(time.Now()) {
			token, err := GenerateToken(existing.ID, s.jwtSecret)
			if err != nil {
				return nil, "", err
			}
			return existing, token, nil
		}
		// guest expires...
		if err := s.repo.Delete(existing.ID); err != nil {
			return nil, "", err
		}
	}

	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	user := &User{
		Nickname:  nickname,
		ExpiresAt: &expiresAt,
	}
	if err := s.repo.Create(user); err != nil {
		return nil, "", err
	}

	token, err := GenerateToken(user.ID, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *Service) FindUserByID(userID string) (*User, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	if user.Email == nil && user.ExpiresAt != nil && user.ExpiresAt.Before(time.Now()) {
		return nil, ErrUserNotFound
	}
	return user, nil
}

// guest user to formal user, require email and password
func (s *Service) Register(userID, email, password string) (*User, string, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", ErrUserNotFound
	}
	if user.Email != nil {
		return nil, "", ErrNotGuest
	}

	byEmail, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, "", err
	}
	if byEmail != nil {
		return nil, "", ErrEmailTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}
	hashStr := string(hash)
	user.Email = &email
	user.PasswordHash = &hashStr
	user.ExpiresAt = nil
	if err := s.repo.Update(user); err != nil {
		return nil, "", err
	}

	token, err := GenerateToken(user.ID, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *Service) Login(req LoginRequest) (*User, string, error) {
	var user *User
	var err error

	if req.Email != "" {
		user, err = s.repo.FindByEmail(req.Email)
	} else {
		user, err = s.repo.FindByNickname(req.Nickname)
	}
	if err != nil {
		return nil, "", err
	}
	if user == nil || user.PasswordHash == nil {
		return nil, "", ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, "", ErrInvalidPassword
	}

	token, err := GenerateToken(user.ID, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}
