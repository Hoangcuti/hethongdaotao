using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[PrimaryKey("EventId", "UserId")]
public partial class AttendanceLog
{
    [Key]
    [Column("EventID")]
    public int EventId { get; set; }

    [Key]
    [Column("UserID")]
    public int UserId { get; set; }

    public bool? Status { get; set; }

    [StringLength(50)]
    public string? AttendanceStatus { get; set; }

    [StringLength(500)]
    public string? CancelReason { get; set; }

    public DateTime? CheckInTime { get; set; }

    [ForeignKey("EventId")]
    [InverseProperty("AttendanceLogs")]
    public virtual OfflineTrainingEvent Event { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("AttendanceLogs")]
    public virtual User User { get; set; } = null!;
}
