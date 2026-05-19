using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class LearningPath
{
    [Key]
    [Column("PathID")]
    public int PathId { get; set; }

    [StringLength(255)]
    public string? PathName { get; set; }

    public string? Description { get; set; }

    [Column("CreatedByDeptID")]
    public int? CreatedByDeptId { get; set; }

    [ForeignKey("CreatedByDeptId")]
    [InverseProperty("LearningPaths")]
    public virtual Department? CreatedByDept { get; set; }

    [InverseProperty("Path")]
    public virtual ICollection<PathCourse> PathCourses { get; set; } = new List<PathCourse>();

    [InverseProperty("Path")]
    public virtual ICollection<UserPathProgress> UserPathProgresses { get; set; } = new List<UserPathProgress>();
}
