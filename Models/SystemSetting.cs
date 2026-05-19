using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class SystemSetting
{
    [Key]
    [StringLength(100)]
    [Unicode(false)]
    public string SettingKey { get; set; } = null!;

    public string? SettingValue { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ModifiedAt { get; set; }
}
