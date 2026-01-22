import psycopg2
from app.core.config import DB_CONFIG

def upgrade_db_phase2():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    try:
        # Create tables
        with open("app/db/schema_phase2.sql", "r") as f:
            sql = f.read()
            cur.execute(sql)
            
        conn.commit()
        print("Database schema upgraded for Phase 2 successfully.")
        
        # Seed some initial tables if empty
        cur.execute("SELECT count(*) FROM restaurant_tables;")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO restaurant_tables (table_number, capacity, location) VALUES 
                (1, 2, 'Window'),
                (2, 2, 'Window'),
                (3, 4, 'Main Hall'),
                (4, 4, 'Main Hall'),
                (5, 6, 'Main Hall'),
                (6, 8, 'Private Room');
            """)
            conn.commit()
            print("Seeded default tables.")
            
    except Exception as e:
        conn.rollback()
        print(f"Error upgrading database: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    upgrade_db_phase2()
