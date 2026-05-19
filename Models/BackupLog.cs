using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class BackupLog
{
    [Key]
    [Column("BackupID")]
    public int BackupId { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? FileName { get; set; }

    [StringLength(50)]
    public string? BackupType { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }
}
