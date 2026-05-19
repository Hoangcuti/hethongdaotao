using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[Index("CertCode", Name = "UQ__Certific__237CF9FD1E984B32", IsUnique = true)]
public partial class Certificate
{
    [Key]
    [Column("CertID")]
    public int CertId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    [Column("CourseID")]
    public int? CourseId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? IssueDate { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string? CertCode { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("Certificates")]
    public virtual Course? Course { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Certificates")]
    public virtual User? User { get; set; }
}
