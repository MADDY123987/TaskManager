CREATE TABLE task_activities (
                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                 task_id BIGINT NOT NULL,
                                 project_id BIGINT NOT NULL,
                                 actor_id BIGINT NULL,

                                 actor_name VARCHAR(255),

                                 action VARCHAR(80) NOT NULL,
                                 field_name VARCHAR(80),

                                 old_value TEXT,
                                 new_value TEXT,

                                 occurred_at DATETIME NOT NULL,

                                 INDEX idx_task_activities_task (task_id, occurred_at),
                                 INDEX idx_task_activities_project (project_id, occurred_at)
);