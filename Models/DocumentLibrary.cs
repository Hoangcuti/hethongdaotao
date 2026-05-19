using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[Table("DocumentLibrary")]
public partial class DocumentLibrary
{
    [Key]
    [Column("ID")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [StringLength(255)]
    public string? Title { get; set; }

    [StringLength(500)]
    public string? FilePath { get; set; }

    [Column("SharedByDeptID")]
    public int? SharedByDeptId { get; set; }

    [StringLength(50)]
    public string? ApprovalStatus { get; set; }

    [Column("CreatedBy")]
    public int? CreatedBy { get; set; }

    [Column("ApprovedBy")]
    public int? ApprovedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ApprovedAt { get; set; }

    [Column("CourseID")]
    public int? CourseId { get; set; }

    [Column("ModuleID")]
    public int? ModuleId { get; set; }

    [Column("LessonID")]
    public int? LessonId { get; set; }

    [Column("ExamID")]
    public int? ExamId { get; set; }

    [StringLength(255)]
    public string? NewModuleName { get; set; }

    [StringLength(255)]
    public string? NewLessonName { get; set; }

    [StringLength(255)]
    public string? NewExamName { get; set; }

    public string? PendingData { get; set; }

    [StringLength(50)]
    public string? TargetType { get; set; }

    [StringLength(1000)]
    public string? RejectionReason { get; set; }
}
