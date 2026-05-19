using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace KhoaHoc
{
    public class FixEncodingTool
    {
        public static void Run()
        {
            string path = @"d:\KhoaHoc\KhoaHoc\KhoaHoc\Views\IT\Index.cshtml";
            var lines = File.ReadAllLines(path, Encoding.UTF8);

            var fixes = new Dictionary<int, string> {
                { 6, "    <meta name=\"description\" content=\"Dashboard quản trị IT - quản lý tài khoản và hệ thống LMS\" />" },
                { 26, "        <div class=\"page-subtitle\" id=\"pageSubtitle\">Giám sát và quản lý hạ tầng LMS</div>" },
                { 30, "        <button class=\"btn btn-secondary\" data-permission=\"users.manage\" onclick=\"openBulkDeptModal()\">" },
                { 31, "            🚀 Đẩy NV vào phòng ban" },
                { 33, "        <button class=\"btn btn-primary\" data-permission=\"users.manage\" onclick=\"navigate('users'); openModal('createUserModal');\">" },
                { 34, "            👤 Tạo tài khoản" },
                { 48, "                <div class=\"card-header\"><div class=\"card-title\">📊 Phân bổ người dùng</div></div>" },
                { 50, "                    <div id=\"userChartEmpty\" style=\"display:none;padding:40px;text-align:center;color:#94a3b8\">Chưa có dữ liệu</div>" },
                { 55, "                <div class=\"card-header\"><div class=\"card-title\">🕒 Hoạt động gần đây</div></div>" },
                { 70, "                        <span class=\"input-icon\">🔍</span>" },
                { 71, "                        <input id=\"userSearch\" type=\"text\" class=\"form-input with-icon\" placeholder=\"Tìm tên, email, mã NV...\" oninput=\"debouncedLoadUsers()\">" },
                { 81, "                            <th>Nhân viên</th>" },
                { 82, "                            <th>Mã NV</th>" },
                { 83, "                            <th>Phòng ban</th>" },
                { 84, "                            <th>Trạng thái</th>" },
                { 85, "                            <th>Thao tác</th>" },
                { 102, "                    <span class=\"input-icon\">🔍</span>" },
                { 103, "                    <input id=\"courseSearch\" type=\"text\" class=\"form-input with-icon\" placeholder=\"Tìm tên khóa học...\" oninput=\"debouncedLoadItCourses()\">" },
                { 105, "                <button class=\"btn btn-primary\" onclick=\"openCreateCourseModal()\">➕ Thêm Khóa Học</button>" },
                { 114, "                            <th>ID</th>" },
                { 115, "                            <th>Mã KH</th>" },
                { 116, "                            <th>Tên khóa học</th>" },
                { 117, "                            <th>Level</th>" },
                { 118, "                            <th>Danh mục</th>" },
                { 119, "                            <th>Bắt buộc</th>" },
                { 120, "                            <th>Trạng thái</th>" },
                { 121, "                            <th>Thao tác</th>" },
                { 135, "                <button class=\"btn btn-primary\" onclick=\"openCreateDeptModal()\">➕ Thêm Phòng Ban</button>" },
                { 144, "                            <th>ID</th>" },
                { 145, "                            <th>Tên phòng ban</th>" },
                { 146, "                            <th>Trưởng phòng</th>" },
                { 147, "                            <th>Số lượng NV</th>" },
                { 148, "                            <th>Thao tác</th>" },
                { 165, "                            <th>Thời gian</th>" },
                { 166, "                            <th>Người thực hiện</th>" },
                { 167, "                            <th>Hành động</th>" },
                { 168, "                            <th>Chi tiết</th>" },
                { 184, "                <button class=\"btn btn-primary\" onclick=\"openCreateCategoryModal()\">➕ Thêm Danh Mục</button>" },
                { 192, "                            <th>ID</th><th>Tên danh mục</th><th>Khóa học</th><th>FAQ</th><th>Ngân hàng câu hỏi</th><th>Thao tác</th>" },
                { 209, "                    <input id=\"faqSearch\" type=\"text\" class=\"form-input with-icon\" placeholder=\"Tìm câu hỏi...\" oninput=\"debouncedLoadFaqs()\">" },
                { 211, "                <button class=\"btn btn-primary\" onclick=\"openCreateFaqModal()\">➕ Thêm FAQ</button>" },
                { 219, "                            <th style=\"width:40%\">Câu hỏi</th><th>Câu trả lời</th><th>Danh mục</th><th>Thao tác</th>" },
                { 236, "                    <div class=\"card-title\">📚 Danh sách thành viên</div>" },
                { 237, "                    <div class=\"card-subtitle\">Quản lý kho chương, bài giảng và quiz trong toàn hệ thống.</div>" },
                { 243, "                        <button id=\"libraryTabModules\" class=\"btn btn-primary\" onclick=\"switchLibraryTab('modules')\">🧩 Kho Chương</button>" },
                { 244, "                        <button id=\"libraryTabLessons\" class=\"btn btn-secondary\" onclick=\"switchLibraryTab('lessons')\">📝 Kho Bài Giảng</button>" },
                { 245, "                        <button id=\"libraryTabExams\" class=\"btn btn-secondary\" onclick=\"switchLibraryTab('exams')\">❓ Kho Quiz</button>" },
                { 247, "                    <button id=\"libraryCreateBtn\" class=\"btn btn-primary\" onclick=\"openLibraryCreateModal()\">➕ Tạo mới</button>" },
                { 256, "                        <span class=\"input-icon\">🔍</span>" },
                { 257, "                        <input id=\"librarySearch\" type=\"text\" class=\"form-input with-icon\" placeholder=\"Tìm theo tên chương, bài giảng, quiz hoặc khóa học...\" oninput=\"renderDocumentLibrary()\">" },
                { 260, "                        <option value=\"\">Tất cả khóa học</option>" },
                { 268, "                <div class=\"stat-icon blue\">🧩</div>" },
                { 270, "                <div class=\"stat-label\">Tổng số chương</div>" },
                { 273, "                <div class=\"stat-icon green\">📝</div>" },
                { 275, "                <div class=\"stat-label\">Tổng số bài giảng</div>" },
                { 278, "                <div class=\"stat-icon cyan\">📎</div>" },
                { 280, "                <div class=\"stat-label\">Tổng số tài liệu</div>" },
                { 283, "                <div class=\"stat-icon orange\">❓</div>" },
                { 285, "                <div class=\"stat-label\">Tổng số Quiz</div>" },
                { 304, "                <div class=\"card-header\"><div class=\"card-title\">🏢 Nhân viên theo phòng ban</div></div>" },
                { 308, "                <div class=\"card-header\"><div class=\"card-title\">📚 Khóa học theo danh mục</div></div>" },
                { 314, "                <div class=\"card-header\"><div class=\"card-title\">📈 Enrollment theo tháng (6 tháng gần nhất)</div></div>" },
                { 318, "                <div class=\"card-header\"><div class=\"card-title\">🎯 Tỷ lệ pass/fail Quiz</div></div>" },
                { 326, "            <div class=\"card-header\"><div class=\"card-title\">🏆 Top 5 khóa học phổ biến nhất</div></div>" },
                { 329, "                    <thead><tr><th>#</th><th>Tên khóa học</th><th>Số học viên</th></tr></thead>" },
                { 350, "                        <button class=\"btn btn-primary\" onclick=\"createBackup()\">💾 Tạo Backup Ngay</button>" },
                { 353, "                        <button class=\"btn btn-secondary\" onclick=\"loadBackupLogs()\">🔄 Làm mới</button>" },
                { 360, "            <div class=\"card-header\"><div class=\"card-title\">📜 Lịch sử Backup</div></div>" },
                { 364, "                        <tr><th>ID</th><th>Tên file</th><th>Loại</th><th>Thời gian tạo</th></tr>" },
                { 379, "                    <div class=\"card-title\">🔑 Phân quyền chức năng</div>" },
                { 380, "                    <div class=\"card-subtitle\">Chọn role hoặc người dùng, sau đó bấm vào từng khung để bật hoặc tắt chức năng.</div>" },
                { 403, "                    <div style=\"font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em\">Đối tượng đang chỉnh</div>" },
                { 404, "                    <div id=\"permissionBoardTitle\" style=\"margin-top:6px;font-size:18px;font-weight:800;color:#0f172a\">Chưa chọn đối tượng</div>" },
                { 408, "                    <div style=\"padding:24px;color:#94a3b8;text-align:center;grid-column:1/-1\">Đang tải danh sách chức năng...</div>" },
                { 417, "                <div class=\"card-title\">⚙️ Cài đặt hệ thống</div>" },
                { 418, "                <button class=\"btn btn-secondary btn-sm\" onclick=\"loadSettings()\">Làm mới</button>" },
                { 423, "                        <tr><th>Khóa</th><th>Giá trị</th><th>Cập nhật lần cuối</th><th>Thao tác</th></tr>" },
                { 437, "            <div class=\"card-header\"><div class=\"card-title\">📧 Danh sách đăng ký Newsletter</div></div>" },
                { 441, "                        <tr><th>Họ tên</th><th>Mã NV</th><th>Chức danh</th><th>Thao tác</th></tr>" },
                { 458, "                <div style=\"font-size:13px;color:#64748b\">Quản lý chức danh nhân viên trong hệ thống</div>" },
                { 459, "                <button class=\"btn btn-primary\" onclick=\"openCreateJobTitleModal()\">➕ Thêm Chức Danh</button>" },
                { 466, "                        <tr><th>ID</th><th>Tên Chức Danh</th><th>Cấp Bậc (Grade)</th><th>Số NV Đang Dùng</th><th>Thao tác</th></tr>" },
                { 480, "                <div class=\"card-header\"><div class=\"card-title\">📥 Xuất Danh Sách Nhân Viên</div></div>" },
                { 482, "                    <p style=\"font-size:13px;color:#64748b;margin-bottom:16px\">Xuất toàn bộ danh sách nhân viên ra file Excel bao gồm phòng ban, chức danh, roles.</p>" },
                { 484, "                        <label style=\"font-size:12px;font-weight:600\">Lọc theo trạng thái</label>" },
                { 486, "                            <option value=\"\">Tất cả</option>" },
                { 495, "                <div class=\"card-header\"><div class=\"card-title\">📈 Báo Cáo Đào Tạo</div></div>" },
                { 497, "                    <p style=\"font-size:13px;color:#64748b;margin-bottom:16px\">Xuất báo cáo phân công đào tạo, trạng thái hoàn thành, hạn nộp theo từng nhân viên.</p>" },
                { 498, "                    <div style=\"background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:10px;margin-bottom:16px;font-size:12px;color:#065f46\">💡 Các dòng quá hạn sẽ được tô đỏ trong Excel</div>" },
                { 503, "                <div class=\"card-header\"><div class=\"card-title\">📝 Kết Quả Bài Kiểm Tra</div></div>" },
                { 505, "                    <p style=\"font-size:13px;color:#64748b;margin-bottom:16px\">Xuất kết quả bài kiểm tra đã hoàn thành, điểm số và kết quả Đạt/Không Đạt.</p>" },
                { 506, "                    <div style=\"background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px;margin-bottom:16px;font-size:12px;color:#7f1d1d\">❌ Kết quả Không Đạt sẽ được tô đỏ</div>" },
                { 511, "        <div id=\"exportMsg\" style=\"margin-top:16px;padding:12px 20px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.3);border-radius:8px;font-size:13px;color:#1e40af;display:none\">⏳ Đang tạo file Excel, vui lòng chờ ...</div>" },
                { 519, "        <div class=\"modal-header\"><div class=\"modal-title\" id=\"jobTitleModalTitle\">➕ Thêm Chức Danh</div><button class=\"modal-close\" onclick=\"closeModal('jobTitleModal')\">✖</button></div>" },
                { 522, "            <div class=\"form-group\"><label>Tên Chức Danh *</label><input id=\"jobTitleModalName\" type=\"text\" class=\"form-input\" placeholder=\"VD: Nhân viên kinh doanh, Trưởng phòng...\"></div>" },
                { 526, "                <div style=\"font-size:11px;color:#94a3b8;margin-top:4px\">Số càng cao = cấp bậc càng cao.</div>" },
                { 536, "        <div class=\"modal-header\"><div class=\"modal-title\">👤 Tạo tài khoản</div><button class=\"modal-close\" onclick=\"closeModal('createUserModal')\">✖</button></div>" },
                { 538, "            <div class=\"form-group\"><label>Tên đăng nhập</label><input id=\"newUsername\" type=\"text\" class=\"form-input\"></div>" },
                { 539, "            <div class=\"form-group\"><label>Mật khẩu</label><input id=\"newPassword\" type=\"password\" class=\"form-input\" value=\"123\"></div>" },
                { 540, "            <div class=\"form-group\"><label>Họ và tên</label><input id=\"newFullName\" type=\"text\" class=\"form-input\"></div>" },
                { 541, "            <div class=\"form-group\"><label>Giảng viên</label><input id=\"scheduleInstructor\" class=\"form-input\" placeholder=\"VD: Nguyễn Văn A\"></div>" },
                { 552, "        <div class=\"modal-header\"><div class=\"modal-title\">📝 Sửa tài khoản</div><button class=\"modal-close\" onclick=\"closeModal('editUserModal')\">✖</button></div>" },
                { 555, "            <div class=\"form-group\"><label>Họ và tên</label><input id=\"editFullName\" type=\"text\" class=\"form-input\"></div>" },
                { 557, "            <div class=\"form-group\"><label>Trạng thái</label>" },
                { 563, "            <div class=\"form-group\"><label>Mật khẩu mới (Nếu đổi)</label><input id=\"editPassword\" type=\"password\" class=\"form-input\"></div>" },
                { 571, "        <div class=\"modal-header\"><div class=\"modal-title\">Phân quyền người dùng</div><button class=\"modal-close\" onclick=\"closeModal('userRoleModal')\">✖</button></div>" },
                { 584, "        <div class=\"modal-header\"><div class=\"modal-title\" id=\"courseModalTitle\">Tạo khóa học</div><button class=\"modal-close\" onclick=\"closeModal('courseModal')\">✖</button></div>" },
                { 587, "                <label class=\"form-label\" style=\"color: #7c3aed;\">🚀 Tạo tự động bằng AI</label>" },
                { 594, "            <div class=\"form-group\"><label>Mã khóa học *</label><input id=\"courseModalCodeInput\" type=\"text\" class=\"form-input\" placeholder=\"VD: IT201\"></div>" },
                { 595, "            <div class=\"form-group\"><label>Level</label><select id=\"courseModalLevel\" class=\"form-input\"><option value=\"\">-- Chọn level --</option><option value=\"1\">Level 1</option><option value=\"2\">Level 2</option><option value=\"3\">Level 3</option></select></div>" },
                { 596, "            <div class=\"form-group\"><label>Tên khóa học *</label><input id=\"courseModalTitleInput\" type=\"text\" class=\"form-input\"></div>" },
                { 597, "            <div class=\"form-group\"><label>Mô tả</label><textarea id=\"courseModalDesc\" class=\"form-input\" rows=\"3\"></textarea></div>" },
                { 599, "                <div class=\"form-group\"><label>Ngày bắt đầu</label><input id=\"courseModalStartDate\" type=\"date\" class=\"form-input\"></div>" },
                { 600, "                <div class=\"form-group\"><label>Ngày kết thúc</label><input id=\"courseModalEndDate\" type=\"date\" class=\"form-input\"></div>" }
            };

            foreach (var fix in fixes)
            {
                if (fix.Key < lines.Length)
                {
                    lines[fix.Key] = fix.Value;
                }
            }

            File.WriteAllLines(path, lines, new UTF8Encoding(true));
            Console.WriteLine($"Applied {fixes.Count} fixes.");
        }
    }
}
