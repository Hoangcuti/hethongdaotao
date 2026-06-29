using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KhoaHoc.Models;

[Table("ExamProctoringPhotos")]
public partial class ExamProctoringPhoto
{
    [Key]
    [Column("PhotoID")]
    public int PhotoId { get; set; }

    [Column("UserExamID")]
    public int UserExamId { get; set; }

    [Required]
    [StringLength(500)]
    public string PhotoUrl { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime CapturedAt { get; set; } = DateTime.Now;

    [ForeignKey("UserExamId")]
    public virtual UserExam UserExam { get; set; } = null!;
}
