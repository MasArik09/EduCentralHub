package controllers

import (
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"unicode"

	"EduCentralHub/config"
	"EduCentralHub/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// ════════════════════════════════════════════════════════════════════════════
// SECURITY LAYER: Compiled Regex validators (compiled once at init, zero alloc)
// ════════════════════════════════════════════════════════════════════════════
var (
	// NIS: strictly numeric digits only (e.g. "10001", "220031")
	regexNIS = regexp.MustCompile(`^\d+$`)

	// Email: standard RFC-5322 simplified pattern
	regexEmail = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

	// WhatsApp: optional, digits with optional leading '+' (e.g. "+6281234567890", "081234567890")
	regexWhatsApp = regexp.MustCompile(`^\+?\d+$`)
)

// sanitizeName collapses excessive internal whitespace from a name/class string
// "  Ahmad    Fauzan  " → "Ahmad Fauzan"
func sanitizeName(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return s
	}
	var b strings.Builder
	prevSpace := false
	for _, r := range s {
		if unicode.IsSpace(r) {
			if !prevSpace {
				b.WriteRune(' ')
			}
			prevSpace = true
		} else {
			b.WriteRune(r)
			prevSpace = false
		}
	}
	return b.String()
}

// Input struct for manual user creation
type CreateUserInput struct {
	Name     string `json:"name" binding:"required"`
	NIS      string `json:"nis"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
	WhatsApp string `json:"whatsapp"`
	Status   string `json:"status"`
}

// POST /api/admin/users
func CreateUser(c *gin.Context) {
	var input CreateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate role
	role := input.Role
	if role != "admin" && role != "teacher" && role != "student" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role must be admin, teacher, or student"})
		return
	}

	// Default status
	status := input.Status
	if status == "" {
		status = "aktif"
	}

	// Check if Email already exists (parameterized query — safe from SQLi)
	var count int64
	config.DB.Model(&models.User{}).Where("email = ?", input.Email).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah terdaftar!"})
		return
	}

	// Check if NIS already exists (parameterized query — safe from SQLi)
	if input.NIS != "" {
		config.DB.Model(&models.User{}).Where("nis = ?", input.NIS).Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "NIS sudah terdaftar!"})
			return
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	wa := input.WhatsApp
	user := models.User{
		Name:     input.Name,
		NIS:      input.NIS,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     role,
		WhatsApp: &wa,
		Status:   status,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User berhasil dibuat!",
		"user":    user,
	})
}

// ════════════════════════════════════════════════════════════════════════════
// POST /api/admin/users/import
// CSV Column Order: NIS, Nama Lengkap, Kelas, No. WhatsApp, Email
// Password auto-generated from NIS, Role auto-set to "student"
//
// SECURITY LAYER:
//   - All DB queries use GORM parameterized placeholders ("field = ?", value)
//   - Zero string concatenation / fmt.Sprintf in any SQL query
//   - Regex validation on NIS (numeric only), Email (RFC format), WhatsApp (digits+optional leading '+')
//   - Name & Class sanitized: TrimSpace + collapse excessive internal whitespace
//   - Intra-batch dedup: detect duplicate NIS/Email within the CSV itself
//   - WhatsApp allowed empty/null without failing the row
//   - Bulk insert via GORM's safe tx.Create(&users) — inherently parameterized
//
// ════════════════════════════════════════════════════════════════════════════
func ImportUsersBulk(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CSV file is required. Gunakan form-data dengan key 'file'."})
		return
	}

	openedFile, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer openedFile.Close()

	reader := csv.NewReader(openedFile)
	reader.TrimLeadingSpace = true

	// Read and skip header row
	_, err = reader.Read()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read CSV header. Pastikan file memiliki baris header."})
		return
	}

	// ── Pre-fetch all classes into a map for O(1) lookup by class name ──
	var allClasses []models.Class
	if err := config.DB.Find(&allClasses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat daftar kelas dari database"})
		return
	}
	classNameToID := make(map[string]uint)
	for _, cls := range allClasses {
		classNameToID[strings.TrimSpace(strings.ToLower(cls.ClassName))] = cls.ID
	}

	// ── Begin isolated DB transaction ──
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	type importedUser struct {
		user    models.User
		classID *uint
	}

	var records []importedUser
	rowNum := 1 // 1-indexed data rows (after header)

	// ── Intra-batch dedup maps: detect duplicates WITHIN the CSV file itself ──
	seenNIS := make(map[string]int)   // NIS → row number where first seen
	seenEmail := make(map[string]int) // email → row number where first seen

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Gagal membaca baris CSV ke-%d", rowNum)})
			return
		}
		rowNum++

		// ── Column count guard ──
		if len(record) < 5 {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Baris ke-%d: Format CSV harus memiliki 5 kolom (NIS, Nama Lengkap, Kelas, No. WhatsApp, Email)", rowNum),
			})
			return
		}

		// ════════════════════════════════════════════════════════════════
		// SANITIZATION LAYER: TrimSpace + collapse excessive whitespace
		// ════════════════════════════════════════════════════════════════
		nis := strings.TrimSpace(record[0])
		name := sanitizeName(record[1])
		className := sanitizeName(record[2])
		whatsapp := strings.TrimSpace(record[3])
		email := strings.TrimSpace(strings.ToLower(record[4])) // normalize email to lowercase

		// ════════════════════════════════════════════════════════════════
		// VALIDATION LAYER: Required fields
		// ════════════════════════════════════════════════════════════════
		if nis == "" {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Baris ke-%d: Kolom NIS tidak boleh kosong", rowNum)})
			return
		}
		if name == "" {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Baris ke-%d: Kolom Nama Lengkap tidak boleh kosong", rowNum)})
			return
		}
		if className == "" {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Baris ke-%d: Kolom Kelas tidak boleh kosong", rowNum)})
			return
		}
		if email == "" {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Baris ke-%d: Kolom Email tidak boleh kosong", rowNum)})
			return
		}

		// ════════════════════════════════════════════════════════════════
		// VALIDATION LAYER: Data type & format checks
		// ════════════════════════════════════════════════════════════════

		// NIS must be numeric-only
		if !regexNIS.MatchString(nis) {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Baris ke-%d: NIS '%s' tidak valid. NIS hanya boleh berisi angka.", rowNum, nis),
			})
			return
		}

		// Email must match standard format
		if !regexEmail.MatchString(email) {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Baris ke-%d: Email '%s' tidak memiliki format yang valid.", rowNum, email),
			})
			return
		}

		// WhatsApp: optional, but if provided must be digits (with optional leading '+')
		if whatsapp != "" && !regexWhatsApp.MatchString(whatsapp) {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Baris ke-%d: No. WhatsApp '%s' tidak valid. Hanya boleh berisi angka dan opsional awalan '+'.", rowNum, whatsapp),
			})
			return
		}

		// ════════════════════════════════════════════════════════════════
		// INTRA-BATCH DEDUP: Detect duplicates within the CSV itself
		// ════════════════════════════════════════════════════════════════
		if prevRow, exists := seenNIS[nis]; exists {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Baris ke-%d: NIS '%s' duplikat dalam file CSV (pertama muncul di baris ke-%d).", rowNum, nis, prevRow),
			})
			return
		}
		seenNIS[nis] = rowNum

		if prevRow, exists := seenEmail[email]; exists {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Baris ke-%d: Email '%s' duplikat dalam file CSV (pertama muncul di baris ke-%d).", rowNum, email, prevRow),
			})
			return
		}
		seenEmail[email] = rowNum

		// ════════════════════════════════════════════════════════════════
		// CLASS RESOLUTION: Map class name → class_id (from pre-fetched map)
		// ════════════════════════════════════════════════════════════════
		classKey := strings.TrimSpace(strings.ToLower(className))
		classID, classFound := classNameToID[classKey]
		if !classFound {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Baris ke-%d: Kelas '%s' tidak ditemukan di database. Pastikan nama kelas sudah benar.", rowNum, className),
			})
			return
		}

		// ════════════════════════════════════════════════════════════════
		// DATABASE DEDUP: Parameterized queries (anti-SQL Injection)
		// All queries use GORM's safe "field = ?" placeholder binding.
		// Zero string concatenation in SQL. Zero fmt.Sprintf in SQL.
		// ════════════════════════════════════════════════════════════════
		var count int64

		// Check duplicate email against database
		if err := tx.Model(&models.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error saat pengecekan email"})
			return
		}
		if count > 0 {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Baris ke-%d: Email '%s' sudah terdaftar di database!", rowNum, email),
			})
			return
		}

		// Check duplicate NIS against database
		if err := tx.Model(&models.User{}).Where("nis = ?", nis).Count(&count).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error saat pengecekan NIS"})
			return
		}
		if count > 0 {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Baris ke-%d: NIS '%s' sudah terdaftar di database!", rowNum, nis),
			})
			return
		}

		// ════════════════════════════════════════════════════════════════
		// PASSWORD: Auto-generate from NIS + bcrypt hash
		// ════════════════════════════════════════════════════════════════
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(nis), bcrypt.DefaultCost)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		// ════════════════════════════════════════════════════════════════
		// WHATSAPP: nil-safe pointer assignment (NULL if empty)
		// ════════════════════════════════════════════════════════════════
		var waPtr *string
		if whatsapp != "" {
			waPtr = &whatsapp
		}

		cid := classID
		records = append(records, importedUser{
			user: models.User{
				Name:     name,
				NIS:      nis,
				Email:    email,
				Password: string(hashedPassword),
				Role:     "student",
				WhatsApp: waPtr,
				ClassID:  &cid,
				Status:   "aktif",
			},
			classID: &cid,
		})
	}

	if len(records) == 0 {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak ada data siswa yang ditemukan dalam file CSV"})
		return
	}

	// ════════════════════════════════════════════════════════════════════════
	// BULK INSERT via GORM (inherently parameterized & safe from SQLi)
	// ════════════════════════════════════════════════════════════════════════
	var users []models.User
	for _, r := range records {
		users = append(users, r.user)
	}

	if err := tx.Create(&users).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data siswa: " + err.Error()})
		return
	}

	// Create enrollment records for each imported user
	for i, u := range users {
		if records[i].classID != nil {
			enrollment := models.Enrollment{
				StudentID: u.ID,
				ClassID:   *records[i].classID,
			}
			if err := tx.Create(&enrollment).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat enrollment untuk siswa: " + u.Name})
				return
			}
		}
	}

	// ── Commit transaction ──
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Berhasil mengimpor %d siswa baru ke dalam sistem!", len(users)),
		"count":   len(users),
	})
}
