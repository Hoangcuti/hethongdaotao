using System.Net.Mail;
using KhoaHoc.Models;

namespace KhoaHoc.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task NotifyAllDepartmentsAsync(Course course, List<Department> departments);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // Mocking email send
        _logger.LogInformation($"[MOCK EMAIL] To: {to}, Subject: {subject}");
        await Task.CompletedTask;
    }

    public async Task NotifyAllDepartmentsAsync(Course course, List<Department> departments)
    {
        foreach (var dept in departments.Where(d => !string.IsNullOrEmpty(d.DepartmentEmail)))
        {
            string subject = $"[LMS] Khóa học mới bắt buộc: {course.Title}";
            string body = $@"
                <html>
                <body>
                    <h2>Thông báo khóa học mới cho phòng {dept.DepartmentName}</h2>
                    <p>Khóa học <strong>{course.Title}</strong> đã được chỉ định là bắt buộc cho toàn bộ nhân viên.</p>
                    <p>Mô tả: {course.Description}</p>
                    <p>Vui lòng đăng nhập hệ thống LMS để hoàn thành trước thời hạn.</p>
                </body>
                </html>";
            
            await SendEmailAsync(dept.DepartmentEmail!, subject, body);
        }
    }
}
