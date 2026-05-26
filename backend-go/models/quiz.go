package models

import "time"

// Quiz represents the quiz model in the database
type Quiz struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Title     string `gorm:"not null" json:"title"`
	Duration  int    `gorm:"not null" json:"duration"` // Duration in minutes
	ClassID   uint   `gorm:"not null" json:"class_id"`
	Class     Class  `gorm:"foreignKey:ClassID" json:"class"`
	TeacherID uint   `gorm:"not null" json:"teacher_id"`
	Teacher   User   `gorm:"foreignKey:TeacherID" json:"-"`
	Questions string `gorm:"type:text" json:"questions"` // JSON string of questions list

	// Backwards compatibility fields
	SubjectID uint `json:"subject_id,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
