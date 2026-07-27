import sqlite3
import os
from sqlalchemy import create_engine, inspect
from app import app, db

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pentago.db')

def auto_update_db():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    engine = create_engine(f'sqlite:///{db_path}')
    inspector = inspect(engine)

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    with app.app_context():
        # Get all tables from SQLAlchemy models
        for table_name, table in db.metadata.tables.items():
            if not inspector.has_table(table_name):
                continue

            existing_columns = {col['name'].lower() for col in inspector.get_columns(table_name)}
            
            for column in table.columns:
                col_name = column.name
                if col_name.lower() not in existing_columns:
                    col_type = column.type.compile(engine.dialect)
                    
                    # Handle defaults for NOT NULL if necessary, but SQLite ADD COLUMN doesn't strictly need it unless NOT NULL is set without DEFAULT
                    try:
                        c.execute(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type};")
                        conn.commit()
                        print(f"Success: Column '{col_name}' ({col_type}) added to {table_name}.")
                    except sqlite3.OperationalError as e:
                        print(f"Error adding '{col_name}' to {table_name}: {e}")

    conn.close()
    print("Auto-update complete!")

if __name__ == '__main__':
    auto_update_db()
