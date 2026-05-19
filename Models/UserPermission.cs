using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace KhoaHoc.Models;

[Table("UserPermissions")]
public partial class UserPermission
{
    [Column("UserID")]
    public int UserId { get; set; }

    [Column("PermissionID")]
    public int PermissionId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("PermissionId")]
    [InverseProperty("UserPermissions")]
    public virtual Permission Permission { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserPermissions")]
    public virtual User User { get; set; } = null!;
}
