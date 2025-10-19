-- Check if Tournament module exists in the Module table
SELECT id, name, createdAt, updatedAt 
FROM Module 
WHERE name = 'Tournaments';

-- Show all modules for reference
SELECT id, name, createdAt 
FROM Module 
ORDER BY id;
