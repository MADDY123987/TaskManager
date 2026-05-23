CREATE TABLE IF NOT EXISTS notifications (
                                             id BIGINT NOT NULL AUTO_INCREMENT,

                                             user_id BIGINT NOT NULL,

                                             type ENUM(
                                             'TASK_ASSIGNED',
                                             'TASK_COMPLETED',
                                             'TASK_OVERDUE',
                                             'MEMBER_ADDED',
                                             'COMMENT_ADDED',
                                             'PROJECT_UPDATED'
) NOT NULL,

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    reference_type ENUM(
                           'TASK',
                           'PROJECT',
                           'COMMENT'
                       ),

    reference_id BIGINT,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    read_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_notifications_user_unread (user_id, is_read),
    INDEX idx_notifications_user_created (user_id, created_at)
    );