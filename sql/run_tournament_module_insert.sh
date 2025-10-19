#!/bin/bash

# Script to insert Tournament module into the database
# Usage: ./run_tournament_module_insert.sh

echo "🏆 Inserting Tournament Registration module into database..."

# Database connection details
DB_HOST="localhost"
DB_USER="prisma"
DB_PASS="prisma"
DB_NAME="mis"

# SQL command to insert Tournament module
SQL_COMMAND="INSERT INTO Module (name, createdAt, updatedAt) VALUES ('Tournaments', NOW(), NOW());"

# Verification query
VERIFY_COMMAND="SELECT id, name, createdAt FROM Module WHERE name = 'Tournaments';"

echo "📝 Executing SQL command..."
echo "Command: $SQL_COMMAND"

# Try to execute the SQL command
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "$SQL_COMMAND"

if [ $? -eq 0 ]; then
    echo "✅ Tournament module inserted successfully!"
    echo "🔍 Verifying insertion..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "$VERIFY_COMMAND"
else
    echo "❌ Failed to insert Tournament module."
    echo "Please check your database connection and try again."
    echo ""
    echo "Manual SQL commands to run:"
    echo "1. Connect to your database:"
    echo "   mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -D $DB_NAME"
    echo ""
    echo "2. Run this command:"
    echo "   $SQL_COMMAND"
    echo ""
    echo "3. Verify with:"
    echo "   $VERIFY_COMMAND"
fi
