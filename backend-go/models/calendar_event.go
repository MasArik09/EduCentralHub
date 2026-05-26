package models

import "time"

// CalendarEvent represents an academic calendar activity or event
type CalendarEvent struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Date      string    `gorm:"type:date;not null" json:"date"` // Stored in YYYY-MM-DD format
	Type      string    `gorm:"not null" json:"type"`           // "Akademik", "Laporan", "Libur"
	Urgency   string    `gorm:"not null" json:"urgency"`        // "High", "Medium", "Low"
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
