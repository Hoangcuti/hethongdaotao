using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[PrimaryKey("DeptId", "SkillId")]
public partial class DeptRequiredSkill
{
    [Key]
    [Column("DeptID")]
    public int DeptId { get; set; }

    [Key]
    [Column("SkillID")]
    public int SkillId { get; set; }

    public int? MinLevelRequired { get; set; }

    [ForeignKey("DeptId")]
    [InverseProperty("DeptRequiredSkills")]
    public virtual Department Dept { get; set; } = null!;

    [ForeignKey("SkillId")]
    [InverseProperty("DeptRequiredSkills")]
    public virtual Skill Skill { get; set; } = null!;
}
