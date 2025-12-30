-- Fix user passwords with proper bcrypt hashes for password: test123
-- Generated: 2025-11-07

UPDATE users SET password = '$2b$10$d8g.i.ye5T6ZUZor0V3keu83m9hA/HMPCbNK8ZDkl34sx4XTgxsKy' WHERE username = 'admin';
UPDATE users SET password = '$2b$10$CKXLQeA/OVWPNXDi6SIyS.74eS5oGNHbGYfHt3UhNrXKw.BpkuGZC' WHERE username = 'creator1';
UPDATE users SET password = '$2b$10$hHuUseL4///HhyRmO41YiuIVXi9Ulciq.J1H1FGRue/Ndva/WBePq' WHERE username = 'user1';
UPDATE users SET password = '$2b$10$71pimim/U3Ru7YthwGz5W.lB7HJL9qGjkn1JwYvt6PMzQIHYb2cFW' WHERE username = 'user2';
UPDATE users SET password = '$2b$10$sk.DjGKVJJcUMLWb1niIp.tPqHL3KzuMF3ZtAhus.2M45o5VNoBa6' WHERE username = 'user3';
UPDATE users SET password = '$2b$10$.BASWBwzVpxbZRuJoNyNye3Jge5ZEdbNQLZO2Ud9FFGfhRFPN6FLK' WHERE username = 'user4';
UPDATE users SET password = '$2b$10$7vya3XN1UqVO0kxFEL6AGu8cEnPeb2hWPG1yvRxvMAHBZ/gGU.qg.' WHERE username = 'user5';
