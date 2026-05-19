using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class JobTitle
{
    [Key]
    [Column("JobTitleID")]
    public int JobTitleId { get; set; }

    [StringLength(255)]
    public string? TitleName { get; set; }

    public int? GradeLevel { get; set; }

    [InverseProperty("JobTitle")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
