using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KhoaHoc.Models;

[Table("QuizSessionStates")]
public partial class QuizSessionState
{
    [Key]
    [Column("UserExamID")]
    public int UserExamId { get; set; }

    public int CurrentQuestionIndex { get; set; }

    public int RemainingSeconds { get; set; }

    public int AnsweredCount { get; set; }

    public string? SavedAnswersJson { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? LastSavedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? LastActivityAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? SubmittedAt { get; set; }

    [ForeignKey("UserExamId")]
    public virtual UserExam UserExam { get; set; } = null!;
}
