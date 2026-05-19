using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[Table("CourseFeedback")]
public partial class CourseFeedback
{
    [Key]
    [Column("FeedbackID")]
    public int FeedbackId { get; set; }

    [Column("CourseID")]
    public int? CourseId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("CourseFeedbacks")]
    public virtual Course? Course { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("CourseFeedbacks")]
    public virtual User? User { get; set; }
}
