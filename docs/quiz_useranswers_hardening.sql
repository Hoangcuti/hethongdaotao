/* De nghi chay tren SQL Server neu bang UserAnswers chua co khoa/chi muc huu ich */

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_UserAnswers_UserExam_Question'
      AND object_id = OBJECT_ID('dbo.UserAnswers')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_UserAnswers_UserExam_Question
    ON dbo.UserAnswers(UserExamID, QuestionID);
END
GO

IF COL_LENGTH('dbo.QuizSessionStates', 'SubmittedAt') IS NULL
BEGIN
    ALTER TABLE dbo.QuizSessionStates
    ADD SubmittedAt DATETIME NULL;
END
GO
