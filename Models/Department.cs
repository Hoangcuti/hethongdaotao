using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class Department
{
    [Key]
    [Column("DepartmentID")]
    public int DepartmentId { get; set; }

    [StringLength(255)]
    public string DepartmentName { get; set; } = null!;

    [Column("ManagerID")]
    public int? ManagerId { get; set; }

    [Column("ParentDeptID")]
    public int? ParentDeptId { get; set; }

    public string? Description { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string? ThemeColor { get; set; }

    [StringLength(50)]
    public string? SidebarStyle { get; set; }

    [Column("LogoURL")]
    [StringLength(500)]
    public string? LogoUrl { get; set; }

    [StringLength(255)]
    public string? DepartmentEmail { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("OwnerDept")]
    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();

    [InverseProperty("Dept")]
    public virtual ICollection<DeptRequiredSkill> DeptRequiredSkills { get; set; } = new List<DeptRequiredSkill>();

    [InverseProperty("Dept")]
    public virtual ICollection<DeptTrainingBudget> DeptTrainingBudgets { get; set; } = new List<DeptTrainingBudget>();

    [InverseProperty("CreatedByDept")]
    public virtual ICollection<LearningPath> LearningPaths { get; set; } = new List<LearningPath>();

    [InverseProperty("Department")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();

    [InverseProperty("TargetDepartment")]
    public virtual ICollection<Course> TargetedCourses { get; set; } = new List<Course>();

    [InverseProperty("OwnerDepartment")]
    public virtual ICollection<Course> OwnedCourses { get; set; } = new List<Course>();
}
