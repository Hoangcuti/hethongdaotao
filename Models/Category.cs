using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class Category
{
    [Key]
    [Column("CategoryID")]
    public int CategoryId { get; set; }

    [StringLength(255)]
    public string? CategoryName { get; set; }

    [Column("OwnerDeptID")]
    public int? OwnerDeptId { get; set; }

    [InverseProperty("Category")]
    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    [InverseProperty("Category")]
    public virtual ICollection<Faq> Faqs { get; set; } = new List<Faq>();

    [ForeignKey("OwnerDeptId")]
    [InverseProperty("Categories")]
    public virtual Department? OwnerDept { get; set; }

    [InverseProperty("Category")]
    public virtual ICollection<QuestionBank> QuestionBanks { get; set; } = new List<QuestionBank>();
}
