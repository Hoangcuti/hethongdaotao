using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class Skill
{
    [Key]
    [Column("SkillID")]
    public int SkillId { get; set; }

    [StringLength(100)]
    public string? SkillName { get; set; }

    [StringLength(255)]
    public string? Description { get; set; }

    [InverseProperty("Skill")]
    public virtual ICollection<DeptRequiredSkill> DeptRequiredSkills { get; set; } = new List<DeptRequiredSkill>();

    [InverseProperty("Skill")]
    public virtual ICollection<UserSkill> UserSkills { get; set; } = new List<UserSkill>();
}
