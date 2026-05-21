-- V3__create_tasks.sql
CREATE TABLE IF NOT EXISTS tasks (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    project_id  BIGINT          NOT NULL,
    title       VARCHAR(300)    NOT NULL,
    description TEXT,
    priority    ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
    status      ENUM('TODO','IN_PROGRESS','DONE') NOT NULL DEFAULT 'TODO',
    due_date    DATE,
    assigned_to BIGINT,
    created_by  BIGINT          NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_tasks_project    (project_id),
    INDEX idx_tasks_assignee   (assigned_to),
    INDEX idx_tasks_status     (status),
    INDEX idx_tasks_due_status (due_date, status),
    CONSTRAINT fk_task_project  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_assignee FOREIGN KEY (assigned_to) REFERENCES users(id)   ON DELETE SET NULL,
    CONSTRAINT fk_task_creator  FOREIGN KEY (created_by)  REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
