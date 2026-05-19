using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class Lesson
{
    [Key]
    [Column("LessonID")]
    public int LessonId { get; set; }

    [Column("ModuleID")]
    public int? ModuleId { get; set; }

    public string? Title { get; set; }

    [StringLength(50)]
    public string? ContentType { get; set; }

    public string? ContentBody { get; set; }

    [Column("VideoURL")]
    public string? VideoUrl { get; set; }

    public int? Level { get; set; }

    public int? SortOrder { get; set; }

    [InverseProperty("Lesson")]
    public virtual ICollection<LessonAttachment> LessonAttachments { get; set; } = new List<LessonAttachment>();

    [ForeignKey("ModuleId")]
    [InverseProperty("Lessons")]
    public virtual CourseModule? Module { get; set; }

    [InverseProperty("Lesson")]
    public virtual ICollection<UserLessonLog> UserLessonLogs { get; set; } = new List<UserLessonLog>();
}
