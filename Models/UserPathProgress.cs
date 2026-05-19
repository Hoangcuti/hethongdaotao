using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[PrimaryKey("UserId", "PathId")]
[Table("UserPathProgress")]
public partial class UserPathProgress
{
    [Key]
    [Column("UserID")]
    public int UserId { get; set; }

    [Key]
    [Column("PathID")]
    public int PathId { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    public int? PercentComplete { get; set; }

    [ForeignKey("PathId")]
    [InverseProperty("UserPathProgresses")]
    public virtual LearningPath Path { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserPathProgresses")]
    public virtual User User { get; set; } = null!;
}
