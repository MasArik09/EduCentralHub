package models

import "time"

// Class represents the class model in the database
type Class struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ClassName   string    `gorm:"not null" json:"class_name"`
	MaxStudents int       `json:"max_students"`
	MaxTeachers int       `json:"max_teachers"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
