package models

import "time"

// Material represents the study material model in the database
type Material struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"not null" json:"title"`
	FilePath  string    `gorm:"not null" json:"file_path"`
	SubjectID uint      `gorm:"not null" json:"subject_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
