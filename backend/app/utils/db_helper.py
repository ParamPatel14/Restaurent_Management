from app.core.database import get_db_connection

def fetch_one(query, params=None):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(query, params or ())
    result = cur.fetchone()
    cur.close()
    conn.close()
    return result

def fetch_all(query, params=None):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(query, params or ())
    result = cur.fetchall()
    cur.close()
    conn.close()
    return result
