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

func (s *Service) login(userID string) (user *User, accessToken string, refreshToken string, err error) {
	user, err = s.repo.FindByID(userID)
	if err != nil {
		return nil, "", "", err
	}
	if user == nil {
		return nil, "", "", ErrUserNotFound
	}

	accessToken, err = GenerateAccessToken(userID, s.jwtSecret)
	if err != nil {
		return nil, "", "", err
	}
	refreshToken = GenerateRefreshToken()

	return user, accessToken, refreshToken, nil
}

// create or reuse guest user
func (s *Service) CreateOrReuseGuest(nickname string) (*User, string, string, error) {

	existing, err := s.repo.FindByNickname(nickname)
	if err != nil {
		return nil, "", "", err
	}

	// user with this nickname exists
	if existing != nil {

		// is regular user
		if existing.Email != nil {
			return nil, "", "", ErrNicknameRegistered
		}

		// is guest user, just let him login, no verify
		if existing.ExpiresAt != nil && existing.ExpiresAt.After(time.Now()) {
			return s.login(existing.ID)
		}

		// guest expires, delete and go on creating new
		if err := s.repo.Delete(existing.ID); err != nil {
			return nil, "", "", err
		}
	}

	// guest account save for 30 days
	expiresAt := time.Now().Add(30 * 24 * time.Hour)
	user := &User{
		Nickname:  nickname,
		ExpiresAt: &expiresAt,
	}
	if err := s.repo.Create(user); err != nil {
		return nil, "", "", err
	}

	return s.login(user.ID)
}

func (s *Service) FindUserByID(userID string) (*User, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	// guest expired
	if user.Email == nil && user.ExpiresAt != nil && user.ExpiresAt.Before(time.Now()) {
		return nil, ErrUserNotFound
	}
	return user, nil
}

// guest user to regular user, require email and password
func (s *Service) Bind(userID, email, password string) (*User, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	if user.Email != nil {
		return nil, ErrNotGuest
	}

	byEmail, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, err
	}
	if byEmail != nil {
		return nil, ErrEmailTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	hashStr := string(hash)
	user.Email = &email
	user.PasswordHash = &hashStr
	user.ExpiresAt = nil
	if err := s.repo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

// regular user login
// guest user should login by CreateOrReuseGuest
func (s *Service) Login(req LoginRequest) (*User, string, string, error) {
	var user *User
	var err error

	if req.Email != "" {
		user, err = s.repo.FindByEmail(req.Email)
	} else {
		user, err = s.repo.FindByNickname(req.Nickname)
	}
	if err != nil {
		return nil, "", "", err
	}
	if user == nil || user.PasswordHash == nil {
		return nil, "", "", ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, "", "", ErrInvalidPassword
	}

	return s.login(user.ID)
}
