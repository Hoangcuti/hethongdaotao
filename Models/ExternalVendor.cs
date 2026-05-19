using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class ExternalVendor
{
    [Key]
    [Column("VendorID")]
    public int VendorId { get; set; }

    [StringLength(255)]
    public string? VendorName { get; set; }

    [StringLength(100)]
    public string? ContactPerson { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string? Phone { get; set; }
}
