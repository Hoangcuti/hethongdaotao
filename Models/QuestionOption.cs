using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class QuestionOption
{
    [Key]
    [Column("OptionID")]
    public int OptionId { get; set; }

    [Column("QuestionID")]
    public int? QuestionId { get; set; }

    public string? OptionText { get; set; }

    public bool? IsCorrect { get; set; }

    [ForeignKey("QuestionId")]
    [InverseProperty("QuestionOptions")]
    public virtual QuestionBank? Question { get; set; }
}
