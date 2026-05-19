using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[PrimaryKey("PathId", "CourseId")]
public partial class PathCourse
{
    [Key]
    [Column("PathID")]
    public int PathId { get; set; }

    [Key]
    [Column("CourseID")]
    public int CourseId { get; set; }

    public int? StepOrder { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("PathCourses")]
    public virtual Course Course { get; set; } = null!;

    [ForeignKey("PathId")]
    [InverseProperty("PathCourses")]
    public virtual LearningPath Path { get; set; } = null!;
}
