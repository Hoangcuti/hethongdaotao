using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class Badge
{
    [Key]
    [Column("BadgeID")]
    public int BadgeId { get; set; }

    [StringLength(100)]
    public string? BadgeName { get; set; }

    [Column("ImageURL")]
    [StringLength(255)]
    public string? ImageUrl { get; set; }

    public string? RequirementDescription { get; set; }

    [InverseProperty("Badge")]
    public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}
