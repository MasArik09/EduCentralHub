package models

import "time"

// User represents the user account model in the database
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	NIS          string    `json:"nis"`
	ClassID      *uint     `json:"class_id"`
	Class        *Class    `gorm:"foreignKey:ClassID" json:"class"`
	WhatsApp     *string   `json:"whatsapp"`
	Email        string    `gorm:"unique;not null" json:"email"`
	Password     string    `gorm:"not null" json:"-"` // Omit password in JSON responses
	Role         string    `gorm:"default:student;not null" json:"role"`
	Status       string    `gorm:"default:aktif;not null" json:"status"` // "aktif" or "nonaktif"
	RefreshToken string    `json:"refresh_token,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
