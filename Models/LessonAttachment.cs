using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class LessonAttachment
{
    [Key]
    [Column("AttachmentID")]
    public int AttachmentId { get; set; }

    [Column("LessonID")]
    public int? LessonId { get; set; }

    [StringLength(255)]
    public string? FileName { get; set; }

    public string? FilePath { get; set; }

    [ForeignKey("LessonId")]
    [InverseProperty("LessonAttachments")]
    public virtual Lesson? Lesson { get; set; }
}
