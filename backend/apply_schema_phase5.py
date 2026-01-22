import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Database connection parameters
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "restaurant_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")

def apply_schema():
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
        )
        cur = conn.cursor()

        # SQL to create payments table
        sql = """
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            order_id INT REFERENCES orders(id),
            amount NUMERIC(10,2) NOT NULL,
            payment_method VARCHAR(50) NOT NULL, -- cash, card, online
            transaction_id VARCHAR(100),
            payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        print("Applying Phase 5 Schema (Payments)...")
        cur.execute(sql)
        conn.commit()
        print("Schema applied successfully!")

    except Exception as e:
        print(f"Error applying schema: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    apply_schema()
