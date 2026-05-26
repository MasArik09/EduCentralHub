package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

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

type HolidayItem struct {
	Date        string `json:"date"`
	Description string `json:"description"`
}

type HolidayResponse struct {
	Status string        `json:"status"`
	Code   int           `json:"code"`
	Data   []HolidayItem `json:"data"`
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

// SyncNationalHolidays fetches Indonesian national holidays from public API and syncs to database
func SyncNationalHolidays(c *gin.Context) {
	// Clean up any incorrect Idul Adha 2026 entries from the database first
	config.DB.Model(&models.CalendarEvent{}).
		Where("date = ? AND name LIKE ?", "2026-05-14", "%Idul Adha%").
		Updates(map[string]interface{}{"date": "2026-05-27"})

	config.DB.Model(&models.CalendarEvent{}).
		Where("date = ? AND name LIKE ?", "2026-05-15", "%Idul Adha%").
		Updates(map[string]interface{}{"date": "2026-05-28"})

	// Ensure "Kenaikan Yesus Kristus" is registered on 2026-05-14
	var kenaikan models.CalendarEvent
	if err := config.DB.Where("date = ? AND name LIKE ?", "2026-05-14", "%Kenaikan%").First(&kenaikan).Error; err != nil {
		newEvent := models.CalendarEvent{
			Name:    "Kenaikan Yesus Kristus",
			Date:    "2026-05-14",
			Type:    "Libur",
			Urgency: "High",
		}
		config.DB.Create(&newEvent)
	}

	years := []int{2025, 2026, 2027}
	count := 0

	for _, year := range years {
		url := fmt.Sprintf("https://api-hari-libur.vercel.app/api?year=%d", year)
		resp, err := http.Get(url)
		if err != nil {
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			continue
		}

		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			continue
		}

		var items []HolidayItem
		var apiResponse HolidayResponse

		if err := json.Unmarshal(bodyBytes, &apiResponse); err == nil && len(apiResponse.Data) > 0 {
			items = apiResponse.Data
		} else {
			var rawList []HolidayItem
			if err := json.Unmarshal(bodyBytes, &rawList); err == nil {
				items = rawList
			}
		}

		for _, item := range items {
			// Data cleaning / sanitization for Idul Adha 2026
			if year == 2026 && strings.Contains(strings.ToLower(item.Description), "idul adha") {
				if item.Date == "2026-05-14" {
					item.Date = "2026-05-27"
				} else if item.Date == "2026-05-15" {
					item.Date = "2026-05-28"
				}
			}

			// Check if holiday already exists for this date and name
			var existing models.CalendarEvent
			err := config.DB.Where("date = ? AND name = ?", item.Date, item.Description).First(&existing).Error
			if err != nil {
				// Not found, insert new entry
				newEvent := models.CalendarEvent{
					Name:    item.Description,
					Date:    item.Date,
					Type:    "Libur",
					Urgency: "High",
				}
				if err := config.DB.Create(&newEvent).Error; err == nil {
					count++
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("Berhasil mensinkronisasi %d hari libur nasional baru.", count),
	})
}
