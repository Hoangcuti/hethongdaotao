using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KhoaHoc.Models;

[Table("ExamViolationLogs")]
public partial class ExamViolationLog
{
    [Key]
    [Column("ViolationID")]
    public int ViolationId { get; set; }

    [Column("UserExamID")]
    public int UserExamId { get; set; }

    [Required]
    [StringLength(50)]
    public string ViolationType { get; set; } = null!;

    [StringLength(500)]
    public string? Details { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [ForeignKey("UserExamId")]
    public virtual UserExam UserExam { get; set; } = null!;
}
