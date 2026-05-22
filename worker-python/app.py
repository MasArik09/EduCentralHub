import os
import psycopg2
from fpdf import FPDF
from datetime import datetime

def generate_rapor(student_id):
    """
    Connects to the educentralhub database, retrieves a student's quiz attempts,
    and generates a stylized PDF report card under the worker-python/dataset folder.
    """
    conn = None
    try:
        # Establish connection to PostgreSQL database
        conn = psycopg2.connect(
            host="localhost",
            database="educentralhub",
            user="postgres",
            password="123",
            port="5432"
        )
        cur = conn.cursor()
        
        # SQL JOIN Query to retrieve student, quiz, and score information
        query = """
            SELECT 
                u.name AS student_name, 
                u.email AS student_email,
                q.title AS quiz_title, 
                qa.score, 
                qa.completed_at
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN users u ON qa.student_id = u.id
            WHERE qa.student_id = %s
            ORDER BY qa.completed_at DESC;
        """
        cur.execute(query, (student_id,))
        rows = cur.fetchall()
        
        # If no quiz attempts were found, attempt to fetch the student's name and email anyway
        if not rows:
            print(f"No quiz attempts found for student ID: {student_id}. Generating empty transcript...")
            cur.execute("SELECT name, email FROM users WHERE id = %s AND role = 'student';", (student_id,))
            student_data = cur.fetchone()
            if not student_data:
                print(f"Error: Student with ID {student_id} does not exist in the database.")
                return False
            student_name, student_email = student_data
            attempts = []
        else:
            student_name = rows[0][0]
            student_email = rows[0][1]
            attempts = [(r[2], r[3], r[4]) for r in rows]
            
        cur.close()
        
        # Ensure output directory exists in the filesystem
        os.makedirs("./dataset", exist_ok=True)
        pdf_path = f"./dataset/rapor_{student_id}.pdf"
        
        # Initialize FPDF document
        pdf = FPDF(orientation='P', unit='mm', format='A4')
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Define Color Palette
        primary_color = (31, 41, 55)   # Charcoal / Dark Slate
        accent_color = (59, 130, 246)   # Royal Blue
        row_alt_color = (243, 244, 246) # Soft Gray
        
        # Header Banner block
        pdf.set_fill_color(*primary_color)
        pdf.rect(0, 0, 210, 42, 'F')
        
        # Header Text
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 18)
        pdf.ln(5)
        pdf.cell(0, 10, "EDUCENTRALHUB REPORT CARD", ln=True, align="C")
        pdf.set_font("Helvetica", "I", 9)
        pdf.cell(0, 4, "Official Student Academic Performance Transcript", ln=True, align="C")
        pdf.ln(18)
        
        # Student Info Card Title
        pdf.set_text_color(31, 41, 55)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "Academic Profile:", ln=True)
        
        # Student Details Block
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(40, 6, "Student Identification:", 0, 0)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 6, f"ID-{student_id}", 0, 1)
        
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(40, 6, "Full Name:", 0, 0)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 6, student_name, 0, 1)
        
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(40, 6, "Email Address:", 0, 0)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 6, student_email, 0, 1)
        
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(40, 6, "Document Exported At:", 0, 0)
        pdf.set_font("Helvetica", "I", 10)
        pdf.cell(0, 6, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 0, 1)
        pdf.ln(10)
        
        # Table Title
        pdf.set_text_color(31, 41, 55)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "Quiz Result Performance Summary:", ln=True)
        pdf.ln(2)
        
        # Table Header Row
        pdf.set_fill_color(*accent_color)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 10)
        
        pdf.cell(95, 10, "  Quiz Title", border=1, align="L", fill=True)
        pdf.cell(35, 10, "Score", border=1, align="C", fill=True)
        pdf.cell(60, 10, "Completion Timestamp", border=1, align="C", fill=True)
        pdf.ln()
        
        # Table Content Rows
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Helvetica", "", 10)
        
        if not attempts:
            pdf.cell(190, 12, "No academic quiz attempts have been recorded for this profile.", border=1, align="C")
            pdf.ln()
        else:
            is_striped = False
            for title, score, comp_date in attempts:
                # Alternate row coloring
                if is_striped:
                    pdf.set_fill_color(*row_alt_color)
                else:
                    pdf.set_fill_color(255, 255, 255)
                    
                date_str = comp_date.strftime("%Y-%m-%d %H:%M:%S") if comp_date else "N/A"
                
                pdf.cell(95, 8, f"  {title}", border=1, align="L", fill=True)
                pdf.cell(35, 8, f"{score} / 100", border=1, align="C", fill=True)
                pdf.cell(60, 8, date_str, border=1, align="C", fill=True)
                pdf.ln()
                is_striped = not is_striped
                
        # Save PDF Document to physical path
        pdf.output(pdf_path)
        print(f"Success: PDF report card created at {pdf_path}")
        return True
        
    except Exception as e:
        print(f"Database error or PDF export failure: {e}")
        return False
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("--------------------------------------------------")
    print("EduCentralHub Report Generation Testing Harness")
    print("--------------------------------------------------")
    
    # Mocking report generation for student_id = 1
    # Since GORM auto-migration is now active, we can run this directly!
    target_student_id = 1
    print(f"Executing mock test for Student ID: {target_student_id}...")
    generate_rapor(target_student_id)
    print("--------------------------------------------------")
