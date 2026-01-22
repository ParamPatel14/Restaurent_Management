from app.core.database import get_db_connection

def fetch_one(query, params=None):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, params or ())
        result = cur.fetchone()
        return result
    finally:
        cur.close()
        conn.close()

def fetch_all(query, params=None):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, params or ())
        result = cur.fetchall()
        return result
    finally:
        cur.close()
        conn.close()

def fetch_one_and_commit(query, params=None):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, params or ())
        result = cur.fetchone()
        conn.commit()
        return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

def execute_query(query, params=None):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, params or ())
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()
