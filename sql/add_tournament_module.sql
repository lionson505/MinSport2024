-- SQL command to insert Tournament Registration module into the Module table
-- Based on Prisma schema: Module { id, name, createdAt, updatedAt, permissions[] }

-- Insert the Tournament Registration module
INSERT INTO Module (name, createdAt, updatedAt) 
VALUES ('Tournaments', NOW(), NOW());

-- Alternative with explicit ID (if you want to match the MODULE_IDS constant)
-- INSERT INTO Module (id, name, createdAt, updatedAt) 
-- VALUES (6, 'Tournaments', NOW(), NOW());

-- Query to verify the insertion
SELECT * FROM Module WHERE name = 'Tournaments';

-- Optional: Insert basic permissions for the Tournament module
-- (Uncomment if you want to add default permissions)
/*
INSERT INTO Permission (moduleId, action, createdAt, updatedAt)
SELECT 
    m.id,
    'read',
    NOW(),
    NOW()
FROM Module m 
WHERE m.name = 'Tournaments';

INSERT INTO Permission (moduleId, action, createdAt, updatedAt)
SELECT 
    m.id,
    'create',
    NOW(),
    NOW()
FROM Module m 
WHERE m.name = 'Tournaments';

INSERT INTO Permission (moduleId, action, createdAt, updatedAt)
SELECT 
    m.id,
    'update',
    NOW(),
    NOW()
FROM Module m 
WHERE m.name = 'Tournaments';

INSERT INTO Permission (moduleId, action, createdAt, updatedAt)
SELECT 
    m.id,
    'delete',
    NOW(),
    NOW()
FROM Module m 
WHERE m.name = 'Tournaments';
*/
