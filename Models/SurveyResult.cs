using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class SurveyResult
{
    [Key]
    [Column("ResultID")]
    public int ResultId { get; set; }

    [Column("SurveyID")]
    public int? SurveyId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    public string? AnswerData { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? SubmittedAt { get; set; }

    [ForeignKey("SurveyId")]
    [InverseProperty("SurveyResults")]
    public virtual Survey? Survey { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("SurveyResults")]
    public virtual User? User { get; set; }
}
