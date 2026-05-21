-- V2__create_projects.sql
CREATE TABLE IF NOT EXISTS projects (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(200)    NOT NULL,
    description TEXT,
    created_by  BIGINT          NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_projects_created_by (created_by),
    CONSTRAINT fk_project_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_members (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    project_id  BIGINT          NOT NULL,
    user_id     BIGINT          NOT NULL,
    role        ENUM('ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
    joined_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_project_member (project_id, user_id),
    INDEX idx_pm_project (project_id),
    INDEX idx_pm_user (user_id),
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
