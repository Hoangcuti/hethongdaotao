using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class UserLessonLog
{
    [Key]
    [Column("LogID")]
    public int LogId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    [Column("LessonID")]
    public int? LessonId { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    public int? DurationSpent { get; set; }

    [ForeignKey("LessonId")]
    [InverseProperty("UserLessonLogs")]
    public virtual Lesson? Lesson { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserLessonLogs")]
    public virtual User? User { get; set; }
}
