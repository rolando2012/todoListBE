CREATE TABLE tags_tasks(
    tag_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36) NOT NULL,
    
    PRIMARY KEY (tag_id, task_id),
    CONSTRAINT fk_tt_tag
        FOREIGN KEY (tag_id) REFERENCES tags(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tt_task
        FOREIGN KEY (task_id) REFERENCES tasks(id)
        ON DELETE CASCADE ON UPDATE CASCADE
)