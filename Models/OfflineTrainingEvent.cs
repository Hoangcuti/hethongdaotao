using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class OfflineTrainingEvent
{
    [Key]
    [Column("EventID")]
    public int EventId { get; set; }

    [Column("CourseID")]
    public int? CourseId { get; set; }

    [StringLength(255)]
    public string? Title { get; set; }

    [StringLength(255)]
    public string? Location { get; set; }

    [StringLength(255)]
    public string? Instructor { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? StartTime { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? EndTime { get; set; }

    [Column("DepartmentID")]
    public int? DepartmentId { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [Column("CreatedBy")]
    public int? CreatedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [StringLength(50)]
    public string? Shift { get; set; }

    [StringLength(50)]
    public string? Session { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? AttendanceStartTime { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? AttendanceEndTime { get; set; }

    [InverseProperty("Event")]
    public virtual ICollection<AttendanceLog> AttendanceLogs { get; set; } = new List<AttendanceLog>();

    [ForeignKey("CourseId")]
    [InverseProperty("OfflineTrainingEvents")]
    public virtual Course? Course { get; set; }
}
