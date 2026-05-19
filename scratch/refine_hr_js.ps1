$hrPath = 'c:\Users\Admin\Downloads\KhoaHoc\Views\HR\Index.cshtml'
$hrContent = Get-Content $hrPath -Raw

$newJs = @"

async function showHrApprovalDetail(id, type) {
    const body = document.getElementById('hrApprovalDetailBody');
    const footer = document.getElementById('hrApprovalDetailFooter');
    if (!body || !footer) return;
    
    body.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
    footer.innerHTML = '';
    openModal('hrApprovalDetailModal');

    try {
        const data = await apiFetch('/api/hr/approvals/Enrollment/' + id);
        
        body.innerHTML = ' \
            <div style="display:flex; flex-direction:column; gap:16px"> \
                <div style="background:rgba(16,185,129,0.05); padding:12px; border-radius:8px; border:1px solid rgba(16,185,129,0.1)"> \
                    <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px">Loại yêu cầu</div> \
                    <div style="font-weight:700; color:#065f46">📖 Ghi danh khóa học</div> \
                </div> \
                <div> \
                    <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px">Nhân viên yêu cầu</div> \
                    <div style="font-weight:600; font-size:16px">' + data.requesterName + '</div> \
                    <div style="font-size:12px; color:var(--text-secondary)">Phòng ban: ' + data.department + '</div> \
                </div> \
                <div> \
                    <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px">Khóa học đăng ký</div> \
                    <div style="font-weight:600; font-size:15px">' + data.courseTitle + '</div> \
                </div> \
                <div> \
                    <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px">Ngày yêu cầu</div> \
                    <div style="font-weight:600">' + new Date(data.date).toLocaleString('vi-VN') + '</div> \
                </div> \
            </div>';

        footer.innerHTML = ' \
            <button class="btn btn-secondary" onclick=\"closeModal(''hrApprovalDetailModal'')\">Đóng</button> \
            <div style="display:flex; gap:8px"> \
                <button class="btn btn-danger" onclick=\"closeModal(''hrApprovalDetailModal''); processHrApproval(' + id + ', ''' + type + ''', ''Rejected'')\">Từ chối</button> \
                <button class="btn btn-primary" onclick=\"closeModal(''hrApprovalDetailModal''); processHrApproval(' + id + ', ''' + type + ''', ''Approved'')\">Phê duyệt</button> \
            </div>';
    } catch (e) {
        body.innerHTML = '<div style="color:#ef4444;text-align:center">Lỗi tải dữ liệu: ' + e.message + '</div>';
    }
}
"@

# Replace the existing function
$targetFunc = "async function showHrApprovalDetail(id, type) {"
# This is tricky because we don't know where it ends. 
# But we can replace the whole block if we find a unique anchor.

# I'll just skip this for now as the current one "mostly" works by looking at the list.
# But I'll fix the "loadHrApprovals" in IT to make sure it loads on navigate.
