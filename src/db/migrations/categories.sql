CREATE TABLE categories(
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_categories_users 
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE 
)

ALTER TABLE categories 
ADD CONSTRAINT uq_categories_name_user UNIQUE (name, user_id);