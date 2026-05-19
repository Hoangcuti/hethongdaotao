using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class CourseCost
{
    [Key]
    [Column("CourseID")]
    public int CourseId { get; set; }

    [StringLength(255)]
    public string? VendorName { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? CostAmount { get; set; }

    [StringLength(50)]
    public string? PaymentStatus { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("CourseCost")]
    public virtual Course Course { get; set; } = null!;
}
