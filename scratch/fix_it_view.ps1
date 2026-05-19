$p = 'c:\Users\Admin\Downloads\KhoaHoc\Views\IT\Index.cshtml'
$c = Get-Content $p -Raw

# 1. Update pageTitles
$t1 = "'newsletter': { title: 'Newsletter', sub: 'Quản lý đăng ký nhận thông báo' },"
$i1 = "`r`n        'approvals': { title: 'Phê duyệt yêu cầu', sub: 'Xét duyệt ghi danh khóa học' },"
if ($c.Contains($t1)) {
    $c = $c.Replace($t1, $t1 + $i1)
}

# 2. Add approvals section
$t2 = '<div id="schedules"'
$i2 = @"
    <div id="approvals" class="page-section" style="display:none">
        <div class="card" style="margin-bottom:16px">
            <div class="card-body" style="padding:14px 20px">
                <div style="font-size:16px;font-weight:700">Danh sách yêu cầu phê duyệt</div>
            </div>
        </div>
        <div class="card">
            <div class="table-wrapper">
                <table class="lms-table">
                    <thead>
                        <tr>
                            <th>Loại</th>
                            <th>Người gửi</th>
                            <th>Nội dung (Khóa học)</th>
                            <th>Ngày gửi</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="itApprovalsTable"></tbody>
                </table>
            </div>
        </div>
    </div>
"@
if ($c.Contains($t2)) {
    $c = $c.Replace($t2, $i2 + "`r`n    " + $t2)
}

# 3. Add approval detail modal
$t3 = '<div id="schedules"' # insert before schedules again or before modals ends
$i3 = @"
    <!-- Approval Detail Modal -->
    <div class="modal-backdrop" id="approvalDetailModal">
        <div class="modal-box" style="max-width:600px">
            <div class="modal-header">
                <div class="modal-title">Chi tiết yêu cầu</div>
                <button class="modal-close" onclick="closeModal('approvalDetailModal')">✕</button>
            </div>
            <div class="modal-body" id="approvalDetailContent"></div>
            <div class="modal-footer" id="approvalDetailFooter"></div>
        </div>
    </div>
"@
$c = $c.Replace($t2, $i3 + "`r`n    " + $t2)

Set-Content $p $c
