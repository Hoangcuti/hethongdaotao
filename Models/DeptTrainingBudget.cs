using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[Table("DeptTrainingBudget")]
public partial class DeptTrainingBudget
{
    [Key]
    [Column("BudgetID")]
    public int BudgetId { get; set; }

    [Column("DeptID")]
    public int? DeptId { get; set; }

    public int? Year { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? TotalBudget { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? SpentAmount { get; set; }

    [ForeignKey("DeptId")]
    [InverseProperty("DeptTrainingBudgets")]
    public virtual Department? Dept { get; set; }
}
