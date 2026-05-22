package models

import "time"

// Enrollment represents the class enrollment model in the database
type Enrollment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	StudentID uint      `gorm:"not null" json:"student_id"`
	ClassID   uint      `gorm:"not null" json:"class_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
