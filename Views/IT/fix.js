const fs = require('fs');
let code = fs.readFileSync('c:/lms/thyachuong/thyachuong/KhoaHoc/Views/IT/Index.cshtml', 'utf8');

// Replace the monkey-patch completely
let monkeyPatchRegex = /const _origNavigate = navigate;\s*function navigate\(page\) \{[\s\S]*?\n\s*\}\s*else \{\s*_origNavigate\(page\);\s*\}\s*\}/;
code = code.replace(monkeyPatchRegex, '// monkey-patch removed');

// Replace the original navigate
let origNavigateRegex = /const pageTitles = \{[\s\S]*?else if \(page === 'exports'\) \{ \/\* no load needed \*\/ \}\n}/;

let newNavigateBody = "const pageTitles = {
        'overview': { title: 'Tổng quan hệ thống', sub: 'Giám sát và quản lý hạ tầng LMS' },
        'users': { title: 'Quản lý người dùng', sub: 'Tìm kiếm, thêm mới và quản lý tài khoản' },
        'courses': { title: 'Quản lý khóa học', sub: 'Cấu hình và kiểm soát nội dung khóa học' },
        'departments': { title: 'Quản lý phòng ban', sub: 'Tổ chức cơ cấu nhân sự' },
        'auditlogs': { title: 'Nhat ky hoat dong', sub: 'Theo doi bien dong va lich su he thong' },
        'jobtitles': { title: 'Quan ly Chuc Danh', sub: 'CRUD chuc danh nhan vien trong to chuc' },
        'exports': { title: 'Xuat Bao Cao Excel', sub: 'Tai xuong bao cao nhan vien, dao tao va ket qua kiem tra' },
        'categories': { title: 'Quản lý danh mục', sub: 'CRUD danh mục khóa học, FAQ và ngân hàng câu hỏi' },
        'faqs': { title: 'Quản lý FAQ', sub: 'Câu hỏi thường gặp' },
        'analytics': { title: 'Phân tích nâng cao', sub: 'Biểu đồ thống kê chi tiết toàn hệ thống' },
        'backup': { title: 'Backup hệ thống', sub: 'Tạo và theo dõi lịch sử sao lưu dữ liệu' },
        'permissions': { title: 'Phân quyền', sub: 'Xem và quản lý quyền hạn theo role' },
        'newsletter': { title: 'Newsletter', sub: 'Quản lý đăng ký nhận thông báo' },
        'settings': { title: 'Cài đặt hệ thống', sub: 'Quản lý tham số cấu hình LMS' }
    };

    if (pageTitles[page]) {
        const titleEl = document.getElementById('pageTitle');
        const subEl = document.getElementById('pageSubtitle');
        if (titleEl) titleEl.textContent = pageTitles[page].title;
        if (subEl) subEl.textContent = pageTitles[page].sub;
    }

    document.querySelectorAll('.page-section').forEach(s => s.style.display = s.id === page ? '' : 'none');
    if (page === 'overview') loadOverview();
    else if (page === 'users') loadUsers();
    else if (page === 'courses') loadItCourses();
    else if (page === 'departments') loadItDepartments();
    else if (page === 'auditlogs') loadAuditLogs();
    else if (page === 'jobtitles') loadJobTitles();
    else if (page === 'categories') typeof loadCategories === 'function' ? loadCategories() : null;
    else if (page === 'faqs') typeof loadFaqs === 'function' ? loadFaqs() : null;
    else if (page === 'analytics') typeof loadAnalytics === 'function' ? loadAnalytics() : null;
    else if (page === 'backup') typeof loadBackupLogs === 'function' ? loadBackupLogs() : null;
    else if (page === 'permissions') typeof loadPermissions === 'function' ? loadPermissions() : null;
    else if (page === 'newsletter') typeof loadNewsletter === 'function' ? loadNewsletter() : null;
    else if (page === 'settings') typeof loadSettings === 'function' ? loadSettings() : null;
    else if (page === 'exports') { /* no load needed */ }
}";

code = code.replace(origNavigateRegex, newNavigateBody.slice(1, -1));

fs.writeFileSync('c:/lms/thyachuong/thyachuong/KhoaHoc/Views/IT/Index.cshtml', code);
console.log('done replacing index');
