ALTER TABLE projects
    ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE projects
    ADD COLUMN archived_at DATETIME NULL;

ALTER TABLE projects
    ADD COLUMN owner_id BIGINT NULL;

ALTER TABLE projects
    ADD COLUMN settings TEXT;

ALTER TABLE projects
    ADD CONSTRAINT fk_project_owner
        FOREIGN KEY(owner_id)
            REFERENCES users(id);

CREATE TABLE kanban_columns (
                                id BIGINT NOT NULL AUTO_INCREMENT,

                                project_id BIGINT NOT NULL,

                                name VARCHAR(100) NOT NULL,

                                position INT NOT NULL DEFAULT 0,

                                color VARCHAR(20),

                                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                PRIMARY KEY(id),

                                UNIQUE KEY uq_kanban_column(project_id,name),

                                INDEX idx_kanban_project(project_id,position),

                                CONSTRAINT fk_kanban_project
                                    FOREIGN KEY(project_id)
                                        REFERENCES projects(id)
                                        ON DELETE CASCADE
);

ALTER TABLE tasks
    ADD COLUMN kanban_column_id BIGINT NULL;

ALTER TABLE tasks
    ADD COLUMN kanban_position INT NOT NULL DEFAULT 0;

ALTER TABLE tasks
    ADD CONSTRAINT fk_task_kanban_column
        FOREIGN KEY(kanban_column_id)
            REFERENCES kanban_columns(id)
            ON DELETE SET NULL;

CREATE TABLE task_attachments (
                                  id BIGINT NOT NULL AUTO_INCREMENT,

                                  task_id BIGINT NOT NULL,

                                  uploaded_by_id BIGINT NOT NULL,

                                  file_name VARCHAR(500) NOT NULL,

                                  storage_key VARCHAR(1000) NOT NULL,

                                  content_type VARCHAR(100),

                                  size_bytes BIGINT,

                                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                  PRIMARY KEY(id),

                                  INDEX idx_task_attachments_task(task_id),

                                  CONSTRAINT fk_attachment_task
                                      FOREIGN KEY(task_id)
                                          REFERENCES tasks(id)
                                          ON DELETE CASCADE,

                                  CONSTRAINT fk_attachment_user
                                      FOREIGN KEY(uploaded_by_id)
                                          REFERENCES users(id)
                                          ON DELETE CASCADE
);