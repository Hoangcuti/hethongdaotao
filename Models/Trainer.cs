using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class Trainer
{
    [Key]
    [Column("TrainerID")]
    public int TrainerId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    [StringLength(255)]
    public string? ExternalName { get; set; }

    public string? Expertise { get; set; }

    [Column(TypeName = "decimal(3, 2)")]
    public decimal? Rating { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Trainers")]
    public virtual User? User { get; set; }
}
