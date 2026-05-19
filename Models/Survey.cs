using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class Survey
{
    [Key]
    [Column("SurveyID")]
    public int SurveyId { get; set; }

    [StringLength(255)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ExpiredDate { get; set; }

    public int? CreatedBy { get; set; }

    [ForeignKey("CreatedBy")]
    [InverseProperty("Surveys")]
    public virtual User? CreatedByNavigation { get; set; }

    [InverseProperty("Survey")]
    public virtual ICollection<SurveyResult> SurveyResults { get; set; } = new List<SurveyResult>();
}
