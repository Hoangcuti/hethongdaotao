using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class LessonComment
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    [Column("LessonID")]
    public int? LessonId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    public string? Content { get; set; }
}
