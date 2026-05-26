package controllers

import (
	"net/http"

	"EduCentralHub/config"
	"EduCentralHub/models"

	"github.com/gin-gonic/gin"
)

// CreateCalendarEventInput defines the payload for creating a new calendar event
type CreateCalendarEventInput struct {
	Name    string `json:"name" binding:"required"`
	Date    string `json:"date" binding:"required"`    // Formatted as YYYY-MM-DD
	Type    string `json:"type" binding:"required"`    // "Akademik", "Laporan", "Libur"
	Urgency string `json:"urgency" binding:"required"` // "High", "Medium", "Low"
}

// GetAllCalendarEvents retrieves calendar events filtered by month and year query parameters
func GetAllCalendarEvents(c *gin.Context) {
	month := c.Query("month")
	year := c.Query("year")

	var events []models.CalendarEvent
	query := config.DB.Order("date ASC")

	// Apply dynamic PostgreSQL extraction filter if parameters are supplied
	if month != "" && year != "" {
		query = query.Where("EXTRACT(MONTH FROM date) = ? AND EXTRACT(YEAR FROM date) = ?", month, year)
	}

	if err := query.Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch calendar events"})
		return
	}

	c.JSON(http.StatusOK, events)
}

// CreateCalendarEvent creates a new academic event in the database
func CreateCalendarEvent(c *gin.Context) {
	var input CreateCalendarEventInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event := models.CalendarEvent{
		Name:    input.Name,
		Date:    input.Date,
		Type:    input.Type,
		Urgency: input.Urgency,
	}

	if err := config.DB.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create calendar event"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Calendar event created successfully",
		"event":   event,
	})
}
