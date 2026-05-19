-- SQL Script to Delete a Course and its Related Data
-- Replace @CourseID with the ID of the course you want to delete

DECLARE @CourseID INT = 17; -- REPLACE THIS WITH THE ACTUAL COURSE ID

BEGIN TRANSACTION;

BEGIN TRY
    -- 1. Delete Quiz Related Data
    DELETE FROM UserAnswers WHERE UserExamID IN (
        SELECT UserExamID FROM UserExams WHERE ExamID IN (
            SELECT ExamID FROM Exams WHERE CourseID = @CourseID
        )
    );

    DELETE FROM QuizSessionStates WHERE UserExamID IN (
        SELECT UserExamID FROM UserExams WHERE ExamID IN (
            SELECT ExamID FROM Exams WHERE CourseID = @CourseID
        )
    );

    DELETE FROM UserExams WHERE ExamID IN (
        SELECT ExamID FROM Exams WHERE CourseID = @CourseID
    );

    DELETE FROM ExamQuestions WHERE ExamID IN (
        SELECT ExamID FROM Exams WHERE CourseID = @CourseID
    );

    DELETE FROM Exams WHERE CourseID = @CourseID;

    -- 2. Delete Lesson Related Data
    DELETE FROM UserLessonLogs WHERE LessonID IN (
        SELECT LessonID FROM Lessons WHERE ModuleID IN (
            SELECT ModuleID FROM CourseModules WHERE CourseID = @CourseID
        )
    );

    DELETE FROM LessonAttachments WHERE LessonID IN (
        SELECT LessonID FROM Lessons WHERE ModuleID IN (
            SELECT ModuleID FROM CourseModules WHERE CourseID = @CourseID
        )
    );

    DELETE FROM Lessons WHERE ModuleID IN (
        SELECT ModuleID FROM CourseModules WHERE CourseID = @CourseID
    );

    DELETE FROM CourseModules WHERE CourseID = @CourseID;

    -- 3. Delete Course Level Relations
    DELETE FROM Enrollments WHERE CourseID = @CourseID;
    DELETE FROM Certificates WHERE CourseID = @CourseID;
    DELETE FROM CourseFeedback WHERE CourseID = @CourseID;
    DELETE FROM CourseCosts WHERE CourseID = @CourseID;
    DELETE FROM PathCourses WHERE CourseID = @CourseID;
    DELETE FROM TrainingAssignments WHERE CourseID = @CourseID;

    -- 4. Delete Offline Events and Attendance
    DELETE FROM AttendanceLogs WHERE EventID IN (
        SELECT EventID FROM OfflineTrainingEvents WHERE CourseID = @CourseID
    );

    DELETE FROM OfflineTrainingEvents WHERE CourseID = @CourseID;

    -- 5. Delete the Course
    DELETE FROM Courses WHERE CourseID = @CourseID;

    COMMIT TRANSACTION;
    PRINT 'Course ' + CAST(@CourseID AS VARCHAR) + ' deleted successfully.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Error occurred: ' + ERROR_MESSAGE();
END CATCH;
