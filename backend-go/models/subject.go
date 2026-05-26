package models

import "time"

// Subject represents the subject model in the database
type Subject struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	SubjectName string    `gorm:"not null" json:"subject_name"`
	SubjectCode string    `json:"subject_code"`
	Curriculum  string    `json:"curriculum"`
	Hours       string    `json:"hours"`
	ClassID     uint      `gorm:"not null" json:"class_id"`
	TeacherID   uint      `gorm:"not null" json:"teacher_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
