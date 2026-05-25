package models

import "time"

// Material represents the study material model in the database
type Material struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `json:"description"`
	FileURL     string    `json:"file_url"`
	ClassID     uint      `gorm:"not null" json:"class_id"`
	Class       Class     `gorm:"foreignKey:ClassID" json:"class"`
	TeacherID   uint      `gorm:"not null" json:"teacher_id"`
	Teacher     User      `gorm:"foreignKey:TeacherID" json:"-"`
	
	// Backwards compatibility fields
	FilePath  string `json:"file_path,omitempty"`
	SubjectID uint   `json:"subject_id,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
