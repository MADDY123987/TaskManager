ALTER TABLE users
    ADD COLUMN phone VARCHAR(30);

ALTER TABLE users
    ADD COLUMN department VARCHAR(100);

ALTER TABLE users
    ADD COLUMN designation VARCHAR(100);

ALTER TABLE users
    ADD COLUMN bio TEXT;

ALTER TABLE users
    ADD COLUMN avatar_url VARCHAR(500);

ALTER TABLE users
    ADD COLUMN notification_email_enabled BOOLEAN
        NOT NULL DEFAULT TRUE;

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

                               PRIMARY KEY(id),

                               INDEX idx_notifications_user_unread(user_id,is_read),
                               INDEX idx_notifications_user_created(user_id,created_at),

                               CONSTRAINT fk_notification_user
                                   FOREIGN KEY(user_id)
                                       REFERENCES users(id)
                                       ON DELETE CASCADE
);