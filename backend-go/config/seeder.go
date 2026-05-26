package config

import (
	"EduCentralHub/models"
	"log"

	"golang.org/x/crypto/bcrypt"
)

// SeedDatabase populates the database with realistic mock data on startup
func SeedDatabase() {
	log.Println("Checking database for seed data...")

	// 1. Seed Classes first so relationships are valid
	var classCount int64
	DB.Model(&models.Class{}).Count(&classCount)
	if classCount == 0 {
		log.Println("Seeding classes...")
		classes := []models.Class{
			{ID: 1, ClassName: "10 IPA-A", MaxStudents: 36, MaxTeachers: 1},
			{ID: 2, ClassName: "10 IPA-B", MaxStudents: 36, MaxTeachers: 2},
			{ID: 3, ClassName: "11 RPL", MaxStudents: 36, MaxTeachers: 3},
		}
		for _, c := range classes {
			if err := DB.Create(&c).Error; err != nil {
				log.Printf("Failed to seed class: %v", err)
			}
		}
	}

	// Helper to safely hash password
	hashPassword := func(pw string) string {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		return string(hashed)
	}

	// 2. Seed Admin & Teacher if they don't exist
	var adminCount int64
	DB.Model(&models.User{}).Where("email = ?", "admin@educentral.com").Count(&adminCount)
	if adminCount == 0 {
		admin := models.User{
			Name:     "Admin Edu",
			Email:    "admin@educentral.com",
			Password: hashPassword("admin123"),
			Role:     "admin",
			Status:   "aktif",
		}
		DB.Create(&admin)
	}

	var teacherCount int64
	DB.Model(&models.User{}).Where("email = ?", "guru@educentral.com").Count(&teacherCount)
	if teacherCount == 0 {
		teacher := models.User{
			Name:     "Budi Guru",
			Email:    "guru@educentral.com",
			Password: hashPassword("guru123"),
			Role:     "teacher",
			Status:   "aktif",
		}
		DB.Create(&teacher)
	}

	// 3. Seed Students
	studentsToSeed := []struct {
		Name    string
		NIS     string
		Email   string
		ClassID uint
	}{
		{"Andi Santoso", "10101", "andi.s@gmail.com", 1},
		{"Rani Rahmawati", "10102", "rani.r@gmail.com", 1},
		{"Gita Wijaya", "10103", "gita.w@gmail.com", 2},
	}

	for _, s := range studentsToSeed {
		var cnt int64
		DB.Model(&models.User{}).Where("email = ?", s.Email).Count(&cnt)
		if cnt == 0 {
			std := models.User{
				Name:     s.Name,
				NIS:      s.NIS,
				Email:    s.Email,
				Password: hashPassword("siswa123"),
				Role:     "student",
				Status:   "aktif",
				ClassID:  &s.ClassID,
			}
			if err := DB.Create(&std).Error; err != nil {
				log.Printf("Failed to seed student %s: %v", s.Name, err)
			}
		}
	}

	// 4. Retrieve students to associate parents
	var andi, rani, gita models.User
	DB.Where("email = ?", "andi.s@gmail.com").First(&andi)
	DB.Where("email = ?", "rani.r@gmail.com").First(&rani)
	DB.Where("email = ?", "gita.w@gmail.com").First(&gita)

	// 5. Seed Parents linked to Students
	phone1, phone2, phone3 := "081234567890", "082345678901", "083456789012"
	parentsToSeed := []struct {
		Name      string
		Email     string
		WhatsApp  *string
		StudentID uint
	}{
		{"Budi Santoso", "budi.s@gmail.com", &phone1, andi.ID},
		{"Siti Rahma", "siti.r@yahoo.com", &phone2, rani.ID},
		{"Heri Wijaya", "heri.w@hotmail.com", &phone3, gita.ID},
	}

	for _, p := range parentsToSeed {
		var cnt int64
		DB.Model(&models.User{}).Where("email = ?", p.Email).Count(&cnt)
		if cnt == 0 {
			studentID := p.StudentID
			parent := models.User{
				Name:      p.Name,
				Email:     p.Email,
				Password:  hashPassword("wali123"),
				WhatsApp:  p.WhatsApp,
				Role:      "parent",
				Status:    "aktif",
				StudentID: &studentID,
			}
			if err := DB.Create(&parent).Error; err != nil {
				log.Printf("Failed to seed parent %s: %v", p.Name, err)
			}
		}
	}

	// 6. Seed Subjects (Mapel)
	var subjectCount int64
	DB.Model(&models.Subject{}).Count(&subjectCount)
	if subjectCount == 0 {
		log.Println("Seeding subjects...")
		subjects := []models.Subject{
			{
				SubjectName: "Matematika Wajib",
				SubjectCode: "MTK-10",
				Curriculum:  "Kurikulum Merdeka",
				Hours:       "4 JP / Minggu",
				ClassID:     1,
				TeacherID:   2,
			},
			{
				SubjectName: "Fisika Peminatan",
				SubjectCode: "FIS-11",
				Curriculum:  "Kurikulum Merdeka",
				Hours:       "3 JP / Minggu",
				ClassID:     1,
				TeacherID:   2,
			},
			{
				SubjectName: "Bahasa Inggris",
				SubjectCode: "ING-10",
				Curriculum:  "Kurikulum Merdeka",
				Hours:       "2 JP / Minggu",
				ClassID:     1,
				TeacherID:   2,
			},
		}
		for _, sub := range subjects {
			if err := DB.Create(&sub).Error; err != nil {
				log.Printf("Failed to seed subject: %v", err)
			}
		}
	}

	log.Println("Database seeding verification completed successfully.")
}
