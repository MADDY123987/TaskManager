ALTER TABLE notifications
    MODIFY COLUMN type ENUM(
    'TASK_ASSIGNED',
    'TASK_COMPLETED',
    'TASK_OVERDUE',
    'MEMBER_ADDED',
    'COMMENT_ADDED',
    'PROJECT_UPDATED'
    ) NOT NULL;

ALTER TABLE notifications
    MODIFY COLUMN reference_type ENUM(
    'TASK',
    'PROJECT',
    'COMMENT'
    );