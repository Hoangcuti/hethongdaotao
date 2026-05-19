# Cap nhat Database va Quiz LMS

## Muc tieu
- Dong bo hien thi khoa hoc `Active` va `Published` cho nhan vien.
- Luu session quiz, dap an tam thoi, ket qua nop bai vao database.
- Tinh xep loai khoa hoc theo trong so 40/60.

## Bang du lieu dang su dung
- `Enrollments`: luu tien do hoc theo khoa hoc.
- `UserLessonLogs`: danh dau bai hoc da hoan thanh.
- `Exams`: cau hinh quiz cua khoa hoc.
- `ExamQuestions`: lien ket quiz va ngan hang cau hoi.
- `QuestionOptions`: dap an lua chon va co/khong dung.
- `UserExams`: moi lan hoc vien mo quiz se tao/tao lai mot session lam bai.
- `UserAnswers`: luu dap an da chon theo `UserExamID` + `QuestionID`.
- `QuizSessionStates`: luu vi tri cau hoi hien tai, so giay con lai, JSON dap an, lan luu cuoi, lan nop bai.

## Logic luu database moi
- Khi hoc vien mo quiz: neu chua co session dang lam thi tao moi trong `UserExams`, sau do tao dong trong `QuizSessionStates`.
- Khi hoc vien auto-save hoac bam Luu nhap:
  - Cap nhat `UserAnswers`.
  - Cap nhat `QuizSessionStates.CurrentQuestionIndex`.
  - Cap nhat `QuizSessionStates.RemainingSeconds`.
  - Cap nhat `QuizSessionStates.AnsweredCount`.
  - Cap nhat `QuizSessionStates.SavedAnswersJson`, `LastSavedAt`, `LastActivityAt`.
- Khi hoc vien nop bai:
  - Tinh diem theo tong `ExamQuestions.Points` cua cac cau tra loi dung.
  - Ghi `UserExams.Score`, `IsFinish = 1`, `EndTime`.
  - Ghi `QuizSessionStates.SubmittedAt`.

## Quy tac xep loai khoa hoc
- Tien do hoc tap: 40%.
- Diem quiz trung binh: 60%.
- Tong diem = `ProgressPercent * 0.4 + QuizAverage * 0.6`.
- Xep loai:
  - Xuat sac: `>= 90` va hoan thanh 100% bai hoc.
  - Gioi: `80 - < 90` va hoan thanh 100% bai hoc.
  - Kha: `70 - < 80` va hoan thanh 100% bai hoc.
  - Trung binh: `50 - < 70` va hoan thanh 100% bai hoc.
  - Khong dat: `< 50` hoac chua hoan thanh bai hoc.

## Ghi chu trien khai
- Hien tai code backend da chay tren cac bang co san, khong bat buoc them bang moi neu schema hien tai da co `QuizSessionStates`, `UserExams`, `UserAnswers`.
- Neu database production chua co khoa logic cho `UserAnswers`, co the bo sung script ben duoi de toi uu truy van va tranh trung ban ghi.

## Script de nghi
Xem file: `docs/quiz_useranswers_hardening.sql`
