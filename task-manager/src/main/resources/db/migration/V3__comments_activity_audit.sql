CREATE TABLE task_comments (
                               id BIGINT NOT NULL AUTO_INCREMENT,

                               task_id BIGINT NOT NULL,
                               author_id BIGINT NOT NULL,

                               content TEXT NOT NULL,

                               edited BOOLEAN NOT NULL DEFAULT FALSE,

                               created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at DATETIME NULL,

                               PRIMARY KEY(id),

                               INDEX idx_task_comments_task(task_id,created_at),

                               CONSTRAINT fk_comment_task
                                   FOREIGN KEY(task_id)
                                       REFERENCES tasks(id)
                                       ON DELETE CASCADE,

                               CONSTRAINT fk_comment_author
                                   FOREIGN KEY(author_id)
                                       REFERENCES users(id)
                                       ON DELETE CASCADE
);

CREATE TABLE task_activities (
                                 id BIGINT NOT NULL AUTO_INCREMENT,

                                 task_id BIGINT NOT NULL,
                                 project_id BIGINT NOT NULL,

                                 actor_id BIGINT NULL,
                                 actor_name VARCHAR(255),

                                 action VARCHAR(80) NOT NULL,

                                 field_name VARCHAR(80),
                                 old_value TEXT,
                                 new_value TEXT,

                                 occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                 PRIMARY KEY(id),

                                 INDEX idx_task_activities_task(task_id,occurred_at),
                                 INDEX idx_task_activities_project(project_id,occurred_at),

                                 CONSTRAINT fk_activity_task
                                     FOREIGN KEY(task_id)
                                         REFERENCES tasks(id)
                                         ON DELETE CASCADE,

                                 CONSTRAINT fk_activity_project
                                     FOREIGN KEY(project_id)
                                         REFERENCES projects(id)
                                         ON DELETE CASCADE,

                                 CONSTRAINT fk_activity_actor
                                     FOREIGN KEY(actor_id)
                                         REFERENCES users(id)
                                         ON DELETE SET NULL
);

CREATE TABLE audit_logs (
                            id BIGINT NOT NULL AUTO_INCREMENT,

                            actor_id BIGINT NULL,
                            actor_email VARCHAR(255),

                            entity_type VARCHAR(80) NOT NULL,
                            entity_id BIGINT NOT NULL,

                            action VARCHAR(80) NOT NULL,

                            description TEXT,

                            ip_address VARCHAR(60),
                            user_agent VARCHAR(500),

                            occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                            PRIMARY KEY(id),

                            INDEX idx_audit_entity(entity_type,entity_id,occurred_at),
                            INDEX idx_audit_actor(actor_id,occurred_at),
                            INDEX idx_audit_action(action,occurred_at),

                            CONSTRAINT fk_audit_actor
                                FOREIGN KEY(actor_id)
                                    REFERENCES users(id)
                                    ON DELETE SET NULL
);