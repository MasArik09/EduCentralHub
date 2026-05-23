package main

import (
	"EduCentralHub/config"
	"EduCentralHub/models"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// 1. Connect to PostgreSQL
	log.Println("Connecting to database...")
	config.ConnectDatabase()

	// 2. Perform Auto-Migration to ensure user table exists
	log.Println("Running AutoMigration for models.User...")
	if err := config.DB.AutoMigrate(&models.User{}); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	// 3. Define target mock accounts
	seedUsers := []models.User{
		{
			Name:     "Admin Edu",
			Email:    "admin@educentral.com",
			Password: "admin123",
			Role:     "admin",
		},
		{
			Name:     "Budi Guru",
			Email:    "guru@educentral.com",
			Password: "guru123",
			Role:     "teacher",
		},
		{
			Name:     "Arthur Student",
			NIS:      "20260001",
			Email:    "siswa@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Bagas Saputra",
			NIS:      "20260002",
			Email:    "bagas@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Chandra Wijaya",
			NIS:      "20260003",
			Email:    "chandra@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Dinda Lestari",
			NIS:      "20260004",
			Email:    "dinda@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Eko Prasetyo",
			NIS:      "20260005",
			Email:    "eko@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Fanya Olivia",
			NIS:      "20260006",
			Email:    "fanya@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Gavin Mackenzie",
			NIS:      "20260007",
			Email:    "gavin@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Hana Sofia",
			NIS:      "20260008",
			Email:    "hana@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Irvan Maulana",
			NIS:      "20260009",
			Email:    "irvan@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Jessica Putri",
			NIS:      "20260010",
			Email:    "jessica@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Kevin Sanjaya",
			NIS:      "20260011",
			Email:    "kevin@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Lando Norris",
			NIS:      "20260012",
			Email:    "lando@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Muhammad Fadli",
			NIS:      "20260013",
			Email:    "fadli@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Nadia Utami",
			NIS:      "20260014",
			Email:    "nadia@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Oscar Piastri",
			NIS:      "20260015",
			Email:    "oscar@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Putra Perkasa",
			NIS:      "20260016",
			Email:    "putra@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Qonita Azizah",
			NIS:      "20260017",
			Email:    "qonita@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Rendy Pangalila",
			NIS:      "20260018",
			Email:    "rendy@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Siti Rahma",
			NIS:      "20260019",
			Email:    "siti@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Taufik Hidayat",
			NIS:      "20260020",
			Email:    "taufik@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Umar Mukhtar",
			NIS:      "20260021",
			Email:    "umar@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Vania Larissa",
			NIS:      "20260022",
			Email:    "vania@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Wahyu Hidayat",
			NIS:      "20260023",
			Email:    "wahyu@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Xavier Malik",
			NIS:      "20260024",
			Email:    "xavier@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Yuda Pratama",
			NIS:      "20260025",
			Email:    "yuda@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Zahra Amalia",
			NIS:      "20260026",
			Email:    "zahra@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Aditya Nugraha",
			NIS:      "20260027",
			Email:    "aditya@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Bunga Citra",
			NIS:      "20260028",
			Email:    "bunga@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Daniel Ricciardo",
			NIS:      "20260029",
			Email:    "daniel@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Esteban Ocon",
			NIS:      "20260030",
			Email:    "esteban@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Fitriani",
			NIS:      "20260031",
			Email:    "fitri@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Gilang Dirga",
			NIS:      "20260032",
			Email:    "gilang@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Hendra Setiawan",
			NIS:      "20260033",
			Email:    "hendra@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Indah Permata",
			NIS:      "20260034",
			Email:    "indah@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Joko Anwar",
			NIS:      "20260035",
			Email:    "joko@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
		{
			Name:     "Kurniawan Dwi",
			NIS:      "20260036",
			Email:    "kurniawan@educentral.com",
			Password: "siswa123",
			Role:     "student",
		},
	}

	// 4. Safely insert or update users
	log.Println("Seeding mock accounts...")
	for _, u := range seedUsers {
		// Hash raw password with bcrypt
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Failed to bcrypt hash password for %s: %v", u.Email, err)
		}
		u.Password = string(hashedPassword)

		var existing models.User
		result := config.DB.Where("email = ?", u.Email).First(&existing)
		if result.Error != nil {
			// Email does not exist: create brand new user
			if err := config.DB.Create(&u).Error; err != nil {
				log.Fatalf("Failed to create user %s: %v", u.Email, err)
			}
			log.Printf("Successfully created user: %s (Role: %s, Email: %s)", u.Name, u.Role, u.Email)
		} else {
			// Email already exists: update existing user profile to keep it synced
			existing.Name = u.Name
			existing.NIS = u.NIS
			existing.Password = u.Password
			existing.Role = u.Role
			if err := config.DB.Save(&existing).Error; err != nil {
				log.Fatalf("Failed to update existing user %s: %v", u.Email, err)
			}
			log.Printf("Successfully updated existing user: %s (Role: %s, Email: %s)", existing.Name, existing.Role, existing.Email)
		}
	}

	log.Println("Database seeding completed successfully!")
}
