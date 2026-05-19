using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class CourseModule
{
    [Key]
    [Column("ModuleID")]
    public int ModuleId { get; set; }

    [Column("CourseID")]
    public int? CourseId { get; set; }

    public string? Title { get; set; }

    public int? SortOrder { get; set; }

    public int? Level { get; set; }

    [Column("TargetDepartmentID")]
    public int? TargetDepartmentId { get; set; }

    [ForeignKey("TargetDepartmentId")]
    public virtual Department? TargetDepartment { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("CourseModules")]
    public virtual Course? Course { get; set; }

    [InverseProperty("Module")]
    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
