using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

public partial class TrainingAssignment
{
    [Key]
    [Column("AssignmentID")]
    public int AssignmentId { get; set; }

    [Column("CourseID")]
    public int? CourseId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    public int? AssignedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? AssignedDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? DueDate { get; set; }

    [StringLength(50)]
    public string? Priority { get; set; }

    [ForeignKey("AssignedBy")]
    [InverseProperty("TrainingAssignmentAssignedByNavigations")]
    public virtual User? AssignedByNavigation { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("TrainingAssignments")]
    public virtual Course? Course { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("TrainingAssignmentUsers")]
    public virtual User? User { get; set; }
}
