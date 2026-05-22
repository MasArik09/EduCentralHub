package config

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB represents the global database connection instance.
// It is exported so that other controllers and models can perform database operations.
var DB *gorm.DB

// ConnectDatabase initializes the connection to the PostgreSQL database using GORM.
func ConnectDatabase() {
	// Connection parameters as requested
	host := "localhost"
	user := "postgres"
	password := "123"
	dbname := "educentralhub"
	port := 5432

	// Construct DSN (Data Source Name)
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port,
	)

	// Attempt connection using GORM
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	DB = database
	log.Println("Database connection established successfully!")
}
