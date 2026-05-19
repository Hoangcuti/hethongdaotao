IF OBJECT_ID('dbo.Permissions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Permissions
    (
        PermissionID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Permissions PRIMARY KEY,
        PermissionKey VARCHAR(100) NULL,
        Description NVARCHAR(255) NULL
    );
END;

IF COL_LENGTH('dbo.Courses', 'Level') IS NULL
    ALTER TABLE dbo.Courses ADD Level INT NULL;

IF COL_LENGTH('dbo.CourseModules', 'Level') IS NULL
    ALTER TABLE dbo.CourseModules ADD Level INT NULL;

IF COL_LENGTH('dbo.Lessons', 'Level') IS NULL
    ALTER TABLE dbo.Lessons ADD Level INT NULL;

IF COL_LENGTH('dbo.Exams', 'Level') IS NULL
    ALTER TABLE dbo.Exams ADD Level INT NULL;

IF OBJECT_ID('dbo.LessonAttachments', 'U') IS NULL AND OBJECT_ID('dbo.Lessons', 'U') IS NOT NULL
BEGIN
    CREATE TABLE dbo.LessonAttachments
    (
        AttachmentID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_LessonAttachments PRIMARY KEY,
        LessonID INT NULL,
        FileName NVARCHAR(255) NULL,
        FilePath NVARCHAR(MAX) NULL,
        CONSTRAINT FK_LessonAttachments_Lesson FOREIGN KEY (LessonID) REFERENCES dbo.Lessons(LessonID)
    );
END;

IF COL_LENGTH('dbo.OfflineTrainingEvents', 'Title') IS NULL
    ALTER TABLE dbo.OfflineTrainingEvents ADD Title NVARCHAR(255) NULL;

IF COL_LENGTH('dbo.OfflineTrainingEvents', 'Instructor') IS NULL
    ALTER TABLE dbo.OfflineTrainingEvents ADD Instructor NVARCHAR(255) NULL;

IF COL_LENGTH('dbo.OfflineTrainingEvents', 'Notes') IS NULL
    ALTER TABLE dbo.OfflineTrainingEvents ADD Notes NVARCHAR(1000) NULL;

IF COL_LENGTH('dbo.OfflineTrainingEvents', 'CreatedBy') IS NULL
    ALTER TABLE dbo.OfflineTrainingEvents ADD CreatedBy INT NULL;

IF COL_LENGTH('dbo.OfflineTrainingEvents', 'CreatedAt') IS NULL
    ALTER TABLE dbo.OfflineTrainingEvents ADD CreatedAt DATETIME NULL CONSTRAINT DF_OfflineTrainingEvents_CreatedAt DEFAULT(GETDATE());

IF OBJECT_ID('dbo.RolePermissions', 'U') IS NULL
    AND OBJECT_ID('dbo.Roles', 'U') IS NOT NULL
    AND OBJECT_ID('dbo.Permissions', 'U') IS NOT NULL
BEGIN
    CREATE TABLE dbo.RolePermissions
    (
        RoleID INT NOT NULL,
        PermissionID INT NOT NULL,
        CONSTRAINT PK_RolePermissions PRIMARY KEY (RoleID, PermissionID),
        CONSTRAINT FK_RolePermissions_Role FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID),
        CONSTRAINT FK_RolePermissions_Permission FOREIGN KEY (PermissionID) REFERENCES dbo.Permissions(PermissionID)
    );
END;

IF OBJECT_ID('dbo.UserPermissions', 'U') IS NULL
    AND OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    AND OBJECT_ID('dbo.Permissions', 'U') IS NOT NULL
BEGIN
    CREATE TABLE dbo.UserPermissions
    (
        UserID INT NOT NULL,
        PermissionID INT NOT NULL,
        CreatedAt DATETIME NULL CONSTRAINT DF_UserPermissions_CreatedAt DEFAULT(GETDATE()),
        CONSTRAINT PK_UserPermissions PRIMARY KEY (UserID, PermissionID),
        CONSTRAINT FK_UserPermissions_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
        CONSTRAINT FK_UserPermissions_Permission FOREIGN KEY (PermissionID) REFERENCES dbo.Permissions(PermissionID)
    );
END;

IF OBJECT_ID('tempdb..#PermissionSeed') IS NOT NULL
    DROP TABLE #PermissionSeed;

CREATE TABLE #PermissionSeed
(
    PermissionKey VARCHAR(100) NOT NULL,
    Description NVARCHAR(255) NOT NULL
);

INSERT INTO #PermissionSeed (PermissionKey, Description)
VALUES
('dashboard.view', N'Xem dashboard'),
('users.manage', N'Quản lý người dùng'),
('departments.manage', N'Quản lý phòng ban'),
('courses.manage', N'Quản lý khóa học'),
('content.modules.manage', N'QL kho chương'),
('content.documents.manage', N'QL kho tài liệu'),
('content.quizzes.manage', N'QL kho quiz'),
('schedules.manage', N'Quản lý lịch học'),
('analytics.view', N'Xem phân tích nâng cao'),
('auditlogs.view', N'Xem nhật ký hoạt động'),
('backup.manage', N'Quản lý backup'),
('permissions.manage', N'Phân quyền hệ thống'),
('newsletter.manage', N'Quản lý newsletter'),
('settings.manage', N'Quản lý cài đặt hệ thống');

UPDATE p
SET p.Description = s.Description
FROM dbo.Permissions p
INNER JOIN #PermissionSeed s ON s.PermissionKey = p.PermissionKey;

INSERT INTO dbo.Permissions (PermissionKey, Description)
SELECT s.PermissionKey, s.Description
FROM #PermissionSeed s
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Permissions p
    WHERE p.PermissionKey = s.PermissionKey
);
