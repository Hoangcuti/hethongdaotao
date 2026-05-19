using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[PrimaryKey("UserId", "BadgeId")]
public partial class UserBadge
{
    [Key]
    [Column("UserID")]
    public int UserId { get; set; }

    [Key]
    [Column("BadgeID")]
    public int BadgeId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? EarnedDate { get; set; }

    [ForeignKey("BadgeId")]
    [InverseProperty("UserBadges")]
    public virtual Badge Badge { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserBadges")]
    public virtual User User { get; set; } = null!;
}
