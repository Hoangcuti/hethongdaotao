using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KhoaHoc.Models;

namespace KhoaHoc.Infrastructure;

public static class AdvancedAnalyticsSeeder
{
    public static async Task SeedAnalyticsDataAsync(CorporateLmsProContext context)
    {
        // Kiểm tra xem đã có đủ dữ liệu chưa
        int existingCourses = await context.Courses.CountAsync();
        if (existingCourses >= 30) return; // Đã đủ dữ liệu

        int userCount = await context.Users.CountAsync();

        Console.WriteLine("Bắt đầu sinh dữ liệu mẫu số lượng lớn cho Analytics...");

        var random = new Random();
        byte[] defaultPasswordHash = SHA256.HashData(Encoding.UTF8.GetBytes("123456"));
        
        // 1. Lấy dữ liệu cơ sở (Roles, Depts, Categories, JobTitles)
        var roleStudent = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Student");
        var depts = await context.Departments
            .Where(d => d.DepartmentName != "Trung tâm Đào tạo Nội bộ" && d.DepartmentName != "test")
            .ToListAsync();
        var jobTitles = await context.JobTitles.ToListAsync();
        var categories = await context.Categories.ToListAsync();
        
        if (roleStudent == null || !depts.Any() || !categories.Any())
        {
            Console.WriteLine("Thiếu dữ liệu cơ sở (Departments/Roles/Categories), vui lòng chạy DatabaseSeeder trước.");
            return;
        }

        // 2. Sinh thêm Users (Lên tới 100 users)
        var newUsers = new List<User>();
        int usersToCreate = 120 - userCount;
        if(usersToCreate <= 0) usersToCreate = 50; // Dự phòng
        
        string[] lastNames = { "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý" };
        string[] middleNames = { "Văn", "Thị", "Hữu", "Thanh", "Minh", "Thu", "Xuân", "Hải", "Đức", "Ngọc", "Tuấn", "Hoài", "Quốc", "Gia", "Bảo" };
        string[] firstNames = { "Anh", "Tuấn", "Dũng", "Linh", "Trang", "Phương", "Hương", "Hùng", "Hải", "Bình", "Nam", "Long", "Mai", "Tâm", "Thành", "Đạt", "Sơn", "Nhung", "Hiếu", "Cường" };

        for (int i = 0; i < usersToCreate; i++)
        {
            var dept = depts[random.Next(depts.Count)];
            var title = jobTitles[random.Next(jobTitles.Count)];
            
            string fullName = $"{lastNames[random.Next(lastNames.Length)]} {middleNames[random.Next(middleNames.Length)]} {firstNames[random.Next(firstNames.Length)]}";
            string code = $"NV{random.Next(10000, 99999)}";
            string username = $"user_{code.ToLower()}";
            
            var user = new User
            {
                Username = username,
                FullName = fullName,
                Email = $"{username}@basau.net",
                EmployeeCode = code,
                PasswordHash = defaultPasswordHash,
                IsItadmin = false,
                IsDeptAdmin = false,
                Status = "Active",
                DepartmentId = dept.DepartmentId,
                JobTitleId = title.JobTitleId
            };
            user.Roles.Add(roleStudent);
            newUsers.Add(user);
        }
        context.Users.AddRange(newUsers);
        await context.SaveChangesAsync();

        var allUsers = await context.Users.ToListAsync();

        // 3. Sinh thêm Courses
        var newCourses = new List<Course>();
        string[] coursePrefixes = { "Kỹ năng", "Cơ bản về", "Nâng cao:", "Hướng dẫn", "Quy trình", "Thực hành", "Tổng quan", "Masterclass:" };
        string[] courseTopics = { "Làm việc nhóm", "Quản lý thời gian", "Giao tiếp hiệu quả", "Xử lý khủng hoảng", "Bán hàng B2B", "Lập trình C#", "Phân tích dữ liệu", "Excel cơ bản", "Marketing số", "Quản trị rủi ro", "Kế toán nội bộ", "An toàn thông tin", "Dịch vụ khách hàng", "Tiếng Anh chuyên ngành", "Bảo trì máy móc" };
        
        var adminUser = allUsers.FirstOrDefault(u => u.IsItadmin == true) ?? allUsers.First();

        for (int i = 0; i < 40; i++)
        {
            var cat = categories[random.Next(categories.Count)];
            var dept = depts[random.Next(depts.Count)];
            string title = $"{coursePrefixes[random.Next(coursePrefixes.Length)]} {courseTopics[random.Next(courseTopics.Length)]} {random.Next(1, 5)}";
            
            var course = new Course
            {
                CourseCode = $"CRS{random.Next(10000, 99999)}",
                Title = title,
                Description = $"Khóa học {title} giúp nâng cao nghiệp vụ cho nhân viên. Bao gồm lý thuyết và thực hành chuyên sâu.",
                Thumbnail = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
                IsMandatory = random.NextDouble() > 0.6,
                Level = random.Next(1, 4),
                Status = "Published",
                CategoryId = cat.CategoryId,
                OwnerDepartmentId = dept.DepartmentId,
                IsForAllDepartments = random.NextDouble() > 0.4,
                CreatedBy = adminUser.UserId,
                CreatedAt = DateTime.Now.AddMonths(-random.Next(1, 12))
            };
            newCourses.Add(course);
        }
        context.Courses.AddRange(newCourses);
        await context.SaveChangesAsync();

        var allCourses = await context.Courses.ToListAsync();

        // 4. Sinh Modules và Exams cho các courses mới
        var allExams = new List<Exam>();
        foreach(var course in newCourses)
        {
            var module = new CourseModule
            {
                CourseId = course.CourseId,
                Title = "Chương 1: Nội dung chính",
                SortOrder = 1,
                Level = course.Level
            };
            context.CourseModules.Add(module);
            await context.SaveChangesAsync();

            var exam = new Exam
            {
                CourseId = course.CourseId,
                ModuleId = module.ModuleId,
                ExamTitle = $"Trắc nghiệm cuối khóa: {course.CourseCode}",
                DurationMinutes = 15,
                PassScore = 80m,
                Level = course.Level,
                MaxAttempts = 3,
                StartDate = course.CreatedAt,
                EndDate = course.CreatedAt?.AddYears(2)
            };
            context.Exams.Add(exam);
            allExams.Add(exam);
        }
        await context.SaveChangesAsync();
        allExams = await context.Exams.ToListAsync();

        // 5. Sinh Enrollments, UserExams, Feedbacks, Certificates
        var enrollments = new List<Enrollment>();
        var userExams = new List<UserExam>();
        var feedbacks = new List<CourseFeedback>();
        var certificates = new List<Certificate>();

        foreach (var user in allUsers)
        {
            // Mỗi user học ngẫu nhiên 8-20 khóa học
            int courseCount = random.Next(8, 21);
            var userCourses = allCourses.OrderBy(x => random.Next()).Take(courseCount).ToList();

            foreach (var course in userCourses)
            {
                var enrollDate = DateTime.Now.AddDays(-random.Next(1, 360));
                
                string[] statuses = { "Not Started", "In Progress", "Completed", "Overdue" };
                // 50% completed, 30% in progress, 10% not started, 10% overdue
                int statusRoll = random.Next(100);
                string status = statusRoll < 50 ? "Completed" : (statusRoll < 80 ? "In Progress" : (statusRoll < 90 ? "Not Started" : "Overdue"));

                var enrollment = new Enrollment
                {
                    UserId = user.UserId,
                    CourseId = course.CourseId,
                    EnrollDate = enrollDate,
                    Status = status,
                    ProgressPercent = status == "Completed" ? 100 : (status == "Not Started" ? 0 : random.Next(10, 90)),
                    CompletedDate = status == "Completed" ? enrollDate.AddDays(random.Next(1, 30)) : null
                };
                enrollments.Add(enrollment);

                if (status == "Completed")
                {
                    var exam = allExams.FirstOrDefault(e => e.CourseId == course.CourseId);
                    if (exam != null)
                    {
                        var uExam = new UserExam
                        {
                            UserId = user.UserId,
                            ExamId = exam.ExamId,
                            Score = random.Next(80, 101),
                            IsFinish = true,
                            StartTime = enrollDate,
                            EndTime = enrollment.CompletedDate ?? enrollDate.AddDays(2)
                        };
                        userExams.Add(uExam);
                    }

                    if (random.NextDouble() > 0.4)
                    {
                        var fb = new CourseFeedback
                        {
                            CourseId = course.CourseId,
                            UserId = user.UserId,
                            Rating = random.Next(3, 6), // 3 to 5 stars
                            Comment = "Rất tuyệt vời!",
                            CreatedAt = enrollment.CompletedDate ?? enrollDate.AddDays(3)
                        };
                        feedbacks.Add(fb);
                    }

                    var cert = new Certificate
                    {
                        UserId = user.UserId,
                        CourseId = course.CourseId,
                        CertCode = $"CERT-{user.UserId}-{course.CourseId}-{random.Next(1000,9999)}",
                        IssueDate = enrollment.CompletedDate ?? enrollDate.AddDays(2)
                    };
                    certificates.Add(cert);
                }
                else if (status == "In Progress" || status == "Overdue")
                {
                    var exam = allExams.FirstOrDefault(e => e.CourseId == course.CourseId);
                    if (exam != null && random.NextDouble() > 0.6)
                    {
                        var uExam = new UserExam
                        {
                            UserId = user.UserId,
                            ExamId = exam.ExamId,
                            Score = random.Next(20, 79),
                            IsFinish = true,
                            StartTime = enrollDate,
                            EndTime = enrollDate.AddDays(2)
                        };
                        userExams.Add(uExam);
                    }
                }
            }
        }

        // Batch insert
        for(int i = 0; i < enrollments.Count; i += 1000)
        {
            context.Enrollments.AddRange(enrollments.Skip(i).Take(1000));
            await context.SaveChangesAsync();
        }
        for (int i = 0; i < userExams.Count; i += 1000)
        {
            context.UserExams.AddRange(userExams.Skip(i).Take(1000));
            await context.SaveChangesAsync();
        }
        for (int i = 0; i < feedbacks.Count; i += 1000)
        {
            context.CourseFeedbacks.AddRange(feedbacks.Skip(i).Take(1000));
            await context.SaveChangesAsync();
        }
        for (int i = 0; i < certificates.Count; i += 1000)
        {
            context.Certificates.AddRange(certificates.Skip(i).Take(1000));
            await context.SaveChangesAsync();
        }

        Console.WriteLine($"AdvancedAnalyticsSeeder hoàn tất. Đã tạo thêm: {usersToCreate} users, 40 courses, {enrollments.Count} enrollments.");
    }
}
