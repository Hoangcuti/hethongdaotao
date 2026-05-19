using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace KhoaHoc.Models;

[Index("EmployeeCode", Name = "UQ__Users__1F642548E30C120B", IsUnique = true)]
[Index("Username", Name = "UQ__Users__536C85E49C15E1D5", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("UserID")]
    public int UserId { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string? EmployeeCode { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string? Username { get; set; }

    [StringLength(255)]
    public string? FullName { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? Email { get; set; }

    public byte[]? PasswordHash { get; set; }

    [Column("DepartmentID")]
    public int? DepartmentId { get; set; }

    [Column("JobTitleID")]
    public int? JobTitleId { get; set; }

    [Column("IsITAdmin")]
    public bool? IsItadmin { get; set; }

    public bool? IsDeptAdmin { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? LastLogin { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<AttendanceLog> AttendanceLogs { get; set; } = new List<AttendanceLog>();

    [InverseProperty("User")]
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    [InverseProperty("User")]
    public virtual ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();

    [InverseProperty("User")]
    public virtual ICollection<CourseFeedback> CourseFeedbacks { get; set; } = new List<CourseFeedback>();

    [InverseProperty("CreatedByNavigation")]
    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    [ForeignKey("DepartmentId")]
    [InverseProperty("Users")]
    public virtual Department? Department { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    [InverseProperty("ActionByNavigation")]
    public virtual ICollection<ItMovementLog> ItMovementLogActionByNavigations { get; set; } = new List<ItMovementLog>();

    [InverseProperty("Employee")]
    public virtual ICollection<ItMovementLog> ItMovementLogEmployees { get; set; } = new List<ItMovementLog>();

    [ForeignKey("JobTitleId")]
    [InverseProperty("Users")]
    public virtual JobTitle? JobTitle { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<NewsletterSubscription> NewsletterSubscriptions { get; set; } = new List<NewsletterSubscription>();

    [InverseProperty("User")]
    public virtual ICollection<SurveyResult> SurveyResults { get; set; } = new List<SurveyResult>();

    [InverseProperty("CreatedByNavigation")]
    public virtual ICollection<Survey> Surveys { get; set; } = new List<Survey>();

    [InverseProperty("User")]
    public virtual ICollection<Trainer> Trainers { get; set; } = new List<Trainer>();

    [InverseProperty("AssignedByNavigation")]
    public virtual ICollection<TrainingAssignment> TrainingAssignmentAssignedByNavigations { get; set; } = new List<TrainingAssignment>();

    [InverseProperty("User")]
    public virtual ICollection<TrainingAssignment> TrainingAssignmentUsers { get; set; } = new List<TrainingAssignment>();

    [InverseProperty("User")]
    public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();

    [InverseProperty("User")]
    public virtual ICollection<UserExam> UserExams { get; set; } = new List<UserExam>();

    [InverseProperty("User")]
    public virtual ICollection<UserLessonLog> UserLessonLogs { get; set; } = new List<UserLessonLog>();

    [InverseProperty("User")]
    public virtual ICollection<UserPathProgress> UserPathProgresses { get; set; } = new List<UserPathProgress>();

    [InverseProperty("User")]
    public virtual UserPoint? UserPoint { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<UserSkill> UserSkills { get; set; } = new List<UserSkill>();

    [ForeignKey("UserId")]
    [InverseProperty("Users")]
    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();

    [InverseProperty("User")]
    public virtual ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
}
