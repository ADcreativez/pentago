import sqlite3

def add_col():
    conn = sqlite3.connect('pentago.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE project ADD COLUMN cyber_kill_chain TEXT")
        print("Added cyber_kill_chain column to project table.")
    except Exception as e:
        print("Column may already exist or error:", e)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    add_col()
