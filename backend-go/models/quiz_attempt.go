package models

import "time"

// QuizAttempt represents a student's attempt at a quiz
type QuizAttempt struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	QuizID      uint      `gorm:"not null" json:"quiz_id"`
	StudentID   uint      `gorm:"not null" json:"student_id"`
	Score       int       `gorm:"not null" json:"score"`
	CompletedAt time.Time `gorm:"not null" json:"completed_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
