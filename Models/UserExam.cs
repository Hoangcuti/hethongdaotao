using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class UserExam
{
    [Key]
    [Column("UserExamID")]
    public int UserExamId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    [Column("ExamID")]
    public int? ExamId { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Score { get; set; }

    public bool? IsFinish { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? StartTime { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? EndTime { get; set; }

    [StringLength(500)]
    public string? ScreenRecordingUrl { get; set; }

    [ForeignKey("ExamId")]
    [InverseProperty("UserExams")]
    public virtual Exam? Exam { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserExams")]
    public virtual User? User { get; set; }

    public virtual ICollection<ExamViolationLog> ExamViolationLogs { get; set; } = new List<ExamViolationLog>();
    public virtual ICollection<ExamProctoringPhoto> ExamProctoringPhotos { get; set; } = new List<ExamProctoringPhoto>();
}
