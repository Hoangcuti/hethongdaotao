using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class AuditLog
{
    [Key]
    [Column("LogID")]
    public int LogId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    [StringLength(50)]
    public string? ActionType { get; set; }

    [StringLength(100)]
    public string? TableName { get; set; }

    public string? Description { get; set; }

    [Column("IPAddress")]
    [StringLength(50)]
    [Unicode(false)]
    public string? Ipaddress { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("AuditLogs")]
    public virtual User? User { get; set; }
}
