using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class NewsletterSubscription
{
    [Key]
    [Column("SubID")]
    public int SubId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    public bool? IsSubscribed { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("NewsletterSubscriptions")]
    public virtual User? User { get; set; }
}
