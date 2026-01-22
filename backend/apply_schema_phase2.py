import os
import sys

# Add the current directory to sys.path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.utils.db_helper import execute_query

def apply_schema():
    schema_path = os.path.join(os.path.dirname(__file__), 'app', 'db', 'schema.sql')
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
    
    # Split by semicolon to execute statements individually if needed, 
    # but execute_query might handle it if it's a simple script. 
    # However, psycopg2 usually prefers one command per execute unless allowed.
    # Let's try executing the whole block.
    try:
        execute_query(schema_sql)
        print("Schema applied successfully.")
    except Exception as e:
        print(f"Error applying schema: {e}")

if __name__ == "__main__":
    apply_schema()
