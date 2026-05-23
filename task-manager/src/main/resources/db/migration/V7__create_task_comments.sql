CREATE TABLE task_comments (
                               id BIGINT PRIMARY KEY AUTO_INCREMENT,

                               task_id BIGINT NOT NULL,
                               author_id BIGINT NOT NULL,

                               content TEXT NOT NULL,

                               edited BOOLEAN NOT NULL DEFAULT FALSE,

                               created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

                               CONSTRAINT fk_task_comments_task
                                   FOREIGN KEY (task_id)
                                       REFERENCES tasks(id)
                                       ON DELETE CASCADE,

                               CONSTRAINT fk_task_comments_author
                                   FOREIGN KEY (author_id)
                                       REFERENCES users(id)
);

CREATE INDEX idx_task_comments_task
    ON task_comments(task_id, created_at);