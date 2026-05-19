using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class UserPoint
{
    [Key]
    [Column("UserID")]
    public int UserId { get; set; }

    public int? TotalPoints { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? LastUpdated { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserPoint")]
    public virtual User User { get; set; } = null!;
}
