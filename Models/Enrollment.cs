using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class Enrollment
{
    [Key]
    [Column("EnrollmentID")]
    public int EnrollmentId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    [Column("CourseID")]
    public int? CourseId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? EnrollDate { get; set; }

    public int? ProgressPercent { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CompletedDate { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("Enrollments")]
    public virtual Course? Course { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Enrollments")]
    public virtual User? User { get; set; }
}
