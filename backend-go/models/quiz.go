package models

import "time"

// Quiz represents the quiz model in the database
type Quiz struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"not null" json:"title"`
	Duration  int       `gorm:"not null" json:"duration"` // Duration in minutes
	SubjectID uint      `gorm:"not null" json:"subject_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
