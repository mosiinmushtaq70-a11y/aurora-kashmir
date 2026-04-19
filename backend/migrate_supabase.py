import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not found in .env")
    exit(1)

engine = create_engine(DATABASE_URL)

def run_migration():
    print(f"Starting migration for Supabase Postgres...")
    
    commands = [
        "ALTER TABLE telemetry_alerts ADD COLUMN IF NOT EXISTS min_kp FLOAT DEFAULT 3.0",
        "ALTER TABLE telemetry_alerts ADD COLUMN IF NOT EXISTS forecast_horizon INTEGER DEFAULT 72",
        "ALTER TABLE telemetry_alerts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
        "ALTER TABLE telemetry_alerts ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP WITH TIME ZONE NULL",
        "ALTER TABLE telemetry_alerts ADD COLUMN IF NOT EXISTS latitude FLOAT8",
        "ALTER TABLE telemetry_alerts ADD COLUMN IF NOT EXISTS longitude FLOAT8"
    ]
    
    with engine.connect() as conn:
        for cmd in commands:
            try:
                conn.execute(text(cmd))
                conn.commit()
                print(f"Executed: {cmd}")
            except Exception as e:
                print(f"Error on '{cmd}': {e}")
                conn.rollback()

    print("\nMigration complete! Your Supabase table is now high-precision ready.")

if __name__ == "__main__":
    run_migration()
