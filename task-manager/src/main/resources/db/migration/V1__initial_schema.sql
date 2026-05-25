CREATE TABLE users (
                       id BIGINT NOT NULL AUTO_INCREMENT,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,

                       email_verified BOOLEAN NOT NULL DEFAULT FALSE,
                       phone VARCHAR(30) NULL,
                       department VARCHAR(100) NULL,
                       designation VARCHAR(100) NULL,
                       bio TEXT NULL,
                       avatar_url VARCHAR(500) NULL,
                       notification_email_enabled BOOLEAN NOT NULL DEFAULT TRUE,

                       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,

                       PRIMARY KEY (id),
                       INDEX idx_users_email (email)
);

CREATE TABLE otp_verifications (
                                   id BIGINT NOT NULL AUTO_INCREMENT,
                                   email VARCHAR(255) NOT NULL,
                                   otp VARCHAR(4) NOT NULL,
                                   purpose ENUM('REGISTRATION', 'PASSWORD_RESET') NOT NULL,
                                   expires_at DATETIME NOT NULL,
                                   verified BOOLEAN NOT NULL DEFAULT FALSE,
                                   used BOOLEAN NOT NULL DEFAULT FALSE,

                                   PRIMARY KEY (id),
                                   INDEX idx_otp_email_purpose (email, purpose)
);

CREATE TABLE projects (
                          id BIGINT NOT NULL AUTO_INCREMENT,
                          name VARCHAR(200) NOT NULL,
                          description TEXT,
                          created_by BIGINT NOT NULL,

                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

                          PRIMARY KEY (id),
                          INDEX idx_projects_created_by (created_by),

                          CONSTRAINT fk_project_creator
                              FOREIGN KEY (created_by)
                                  REFERENCES users(id)
                                  ON DELETE CASCADE
);

CREATE TABLE project_members (
                                 id BIGINT NOT NULL AUTO_INCREMENT,
                                 project_id BIGINT NOT NULL,
                                 user_id BIGINT NOT NULL,
                                 role ENUM('ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
                                 joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                 PRIMARY KEY (id),
                                 UNIQUE KEY uq_project_member (project_id, user_id),
                                 INDEX idx_pm_project (project_id),
                                 INDEX idx_pm_user (user_id),

                                 CONSTRAINT fk_pm_project
                                     FOREIGN KEY (project_id)
                                         REFERENCES projects(id)
                                         ON DELETE CASCADE,

                                 CONSTRAINT fk_pm_user
                                     FOREIGN KEY (user_id)
                                         REFERENCES users(id)
                                         ON DELETE CASCADE
);

CREATE TABLE tasks (
                       id BIGINT NOT NULL AUTO_INCREMENT,
                       project_id BIGINT NOT NULL,
                       title VARCHAR(300) NOT NULL,
                       description TEXT,
                       priority ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
                       status ENUM('TODO','IN_PROGRESS','DONE') NOT NULL DEFAULT 'TODO',
                       due_date DATE,
                       assigned_to BIGINT NULL,
                       created_by BIGINT NOT NULL,

                       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,

                       PRIMARY KEY (id),
                       INDEX idx_tasks_project (project_id),
                       INDEX idx_tasks_assigned_to (assigned_to),
                       INDEX idx_tasks_status (project_id, status),
                       INDEX idx_tasks_due_date (due_date),

                       CONSTRAINT fk_task_project
                           FOREIGN KEY (project_id)
                               REFERENCES projects(id)
                               ON DELETE CASCADE,

                       CONSTRAINT fk_task_assignee
                           FOREIGN KEY (assigned_to)
                               REFERENCES users(id)
                               ON DELETE SET NULL,

                       CONSTRAINT fk_task_creator
                           FOREIGN KEY (created_by)
                               REFERENCES users(id)
);

CREATE TABLE notifications (
                               id BIGINT NOT NULL AUTO_INCREMENT,
                               user_id BIGINT NOT NULL,
                               type VARCHAR(60) NOT NULL,
                               title VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,
                               reference_type VARCHAR(60),
                               reference_id BIGINT,
                               is_read BOOLEAN NOT NULL DEFAULT FALSE,
                               read_at DATETIME,
                               created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                               PRIMARY KEY (id),
                               INDEX idx_notifications_user_unread (user_id, is_read),
                               INDEX idx_notifications_user_created (user_id, created_at),

                               CONSTRAINT fk_notification_user
                                   FOREIGN KEY (user_id)
                                       REFERENCES users(id)
                                       ON DELETE CASCADE
);