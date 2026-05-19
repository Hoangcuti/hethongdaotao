using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[PrimaryKey("UserId", "SkillId")]
public partial class UserSkill
{
    [Key]
    [Column("UserID")]
    public int UserId { get; set; }

    [Key]
    [Column("SkillID")]
    public int SkillId { get; set; }

    public int? LevelScore { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? LastAssessed { get; set; }

    [ForeignKey("SkillId")]
    [InverseProperty("UserSkills")]
    public virtual Skill Skill { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserSkills")]
    public virtual User User { get; set; } = null!;
}
