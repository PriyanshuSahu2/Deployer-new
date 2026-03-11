INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, NOW(), NOW()
FROM roles r
CROSS JOIN permissions p
LEFT JOIN role_permissions rp
  ON rp.role_id = r.id
 AND rp.permission_id = p.id
 AND rp.deleted_at IS NULL
WHERE LOWER(TRIM(r.role_name)) = 'owner'
  AND rp.permission_id IS NULL;
