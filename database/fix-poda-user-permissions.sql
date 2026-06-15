CREATE USER IF NOT EXISTS 'poda_user'@'%' IDENTIFIED BY 'poda_pass';

ALTER USER 'poda_user'@'%' IDENTIFIED BY 'poda_pass';

GRANT ALL PRIVILEGES ON poda_arvore.* TO 'poda_user'@'%';

FLUSH PRIVILEGES;