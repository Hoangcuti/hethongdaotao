using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[PrimaryKey("ExamId", "QuestionId")]
public partial class ExamQuestion
{
    [Key]
    [Column("ExamID")]
    public int ExamId { get; set; }

    [Key]
    [Column("QuestionID")]
    public int QuestionId { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Points { get; set; }

    [ForeignKey("ExamId")]
    [InverseProperty("ExamQuestions")]
    public virtual Exam Exam { get; set; } = null!;

    [ForeignKey("QuestionId")]
    [InverseProperty("ExamQuestions")]
    public virtual QuestionBank Question { get; set; } = null!;
}
