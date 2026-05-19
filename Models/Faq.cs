using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[Table("FAQ")]
public partial class Faq
{
    [Key]
    [Column("FAQID")]
    public int Faqid { get; set; }

    public string? Question { get; set; }

    public string? Answer { get; set; }

    [Column("CategoryID")]
    public int? CategoryId { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("Faqs")]
    public virtual Category? Category { get; set; }
}
