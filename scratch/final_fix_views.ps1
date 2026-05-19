# IT Dashboard Fixes
$itPath = 'c:\Users\Admin\Downloads\KhoaHoc\Views\IT\Index.cshtml'
$itContent = Get-Content $itPath -Raw

# Add JS functions to IT
$itJs = @"

async function showApprovalDetail(id, type) {
    const modal = document.getElementById('approvalDetailModal');
    const body = document.getElementById('approvalDetailContent');
    const footer = document.getElementById('approvalDetailFooter');
    if (!modal || !body || !footer) return;

    body.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
    footer.innerHTML = '';
    openModal('approvalDetailModal');

    try {
        const data = await apiFetch('/api/it/approvals/' + type + '/' + id);
        
        body.innerHTML = ' \
            <div style="display:flex; flex-direction:column; gap:20px"> \
                <div style="background:rgba(59,130,246,0.05); padding:16px; border-radius:12px; border:1px solid rgba(59,130,246,0.1)"> \
                    <div style="display:flex; align-items:center; gap:12px"> \
                        <div style="width:48px; height:48px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700"> \
                            ' + data.requesterName.charAt(0).toUpperCase() + ' \
                        </div> \
                        <div> \
                            <div style="font-weight:700; font-size:18px">' + data.requesterName + '</div> \
                            <div style="font-size:13px; color:var(--text-secondary)">' + data.requesterEmail + ' • ' + data.department + '</div> \
                        </div> \
                    </div> \
                </div> \
                <div> \
                    <div style="font-size:12px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px">Yêu cầu</div> \
                    <div style="font-weight:700; font-size:16px; color:var(--primary)"> \
                        ' + (data.type === 'Enrollment' ? '📖 Đăng ký học: ' : '🆕 Tạo khóa học mới: ') + data.courseTitle + ' \
                    </div> \
                </div> \
                <div> \
                    <div style="font-size:12px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px">Mô tả</div> \
                    <div style="font-size:14px; line-height:1.6; color:var(--text-primary)">' + (data.courseDesc || 'Không có mô tả') + '</div> \
                </div> \
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; padding-top:16px; border-top:1px solid var(--border-color)"> \
                    <div> \
                        <div style="font-size:12px; color:var(--text-secondary)">Ngày gửi</div> \
                        <div style="font-weight:600">' + new Date(data.date).toLocaleString('vi-VN') + '</div> \
                    </div> \
                    <div> \
                        <div style="font-size:12px; color:var(--text-secondary)">Trạng thái hiện tại</div> \
                        <div style="font-weight:600">' + data.status + '</div> \
                    </div> \
                </div> \
            </div>';

        footer.innerHTML = '<button class="btn btn-secondary" onclick=\"closeModal(''approvalDetailModal'')\">Đóng</button> \
            <div style="display:flex; gap:12px"> \
                <button class="btn btn-danger" onclick=\"closeModal(''approvalDetailModal''); processApproval(' + id + ', ''' + type + ''', ''Rejected'')\">Từ chối</button> \
                <button class="btn btn-primary" onclick=\"closeModal(''approvalDetailModal''); processApproval(' + id + ', ''' + type + ''', ''Approved'')\">Phê duyệt</button> \
            </div>';
    } catch (e) {
        body.innerHTML = '<div style="color:#ef4444; padding:20px; text-align:center">Lỗi tải chi tiết: ' + e.message + '</div>';
    }
}
"@

if ($itContent -notmatch "function showApprovalDetail") {
    $itContent = $itContent.Replace("document.addEventListener('DOMContentLoaded', init);", "$itJs`r`n`r`ndocument.addEventListener('DOMContentLoaded', init);")
    Set-Content $itPath $itContent
}

# HR Dashboard Fixes
$hrPath = 'c:\Users\Admin\Downloads\KhoaHoc\Views\HR\Index.cshtml'
$hrContent = Get-Content $hrPath -Raw

$hrModalHtml = @"

    <!-- HR Approval Detail Modal -->
    <div class="modal-backdrop" id="hrApprovalDetailModal">
        <div class="modal-box" style="max-width:550px">
            <div class="modal-header">
                <div class="modal-title">Chi tiết yêu cầu phê duyệt</div>
                <button class="modal-close" onclick="closeModal('hrApprovalDetailModal')">✕</button>
            </div>
            <div class="modal-body" id="hrApprovalDetailBody"></div>
            <div class="modal-footer" id="hrApprovalDetailFooter"></div>
        </div>
    </div>
"@

if ($hrContent -notmatch "id=['""]hrApprovalDetailModal['""]") {
    $hrContent = $hrContent.Replace("<!-- ========== MODALS ========== -->", "<!-- ========== MODALS ========== -->" + $hrModalHtml)
    Set-Content $hrPath $hrContent
}
