using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[Table("IT_Movement_Logs")]
public partial class ItMovementLog
{
    [Key]
    [Column("LogID")]
    public int LogId { get; set; }

    [Column("EmployeeID")]
    public int? EmployeeId { get; set; }

    [Column("FromDeptID")]
    public int? FromDeptId { get; set; }

    [Column("ToDeptID")]
    public int? ToDeptId { get; set; }

    public int? ActionBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? MoveDate { get; set; }

    public string? Reason { get; set; }

    [ForeignKey("ActionBy")]
    [InverseProperty("ItMovementLogActionByNavigations")]
    public virtual User? ActionByNavigation { get; set; }

    [ForeignKey("EmployeeId")]
    [InverseProperty("ItMovementLogEmployees")]
    public virtual User? Employee { get; set; }
}
