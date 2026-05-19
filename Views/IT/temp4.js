let departments = [];
let userChart = null;
let selectedUserIds = [];
let availableRoles = [];
let loadedPermissions = [];
let loadedSettings = [];

async function refreshDepartmentsDropdown() {
    try {
        departments = await apiFetch('/api/it/departments');
        const opts = departments.map(d => `<option value="${d.departmentId}">${d.departmentName}</option>`).join('');
        ['newDepartment', 'bulkDeptSel', 'editDepartment', 'courseModalTargetDept'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<option value="">-- Chọn / Phân bổ sau --</option>' + opts;
        });
    } catch(e) {
        departments = [];
    }
}

async function refreshRoles() {
    try {
        availableRoles = await apiFetch('/api/it/roles');
    } catch(e) {
        availableRoles = [];
    }
}

async function init() {
    await refreshDepartmentsDropdown();
    await refreshRoles();
    navigate('overview');
}

function navigate(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const onclickAttr = link.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`navigate('${page}')`)) {
            link.classList.add('active');
        } else if (page === 'overview' && onclickAttr && onclickAttr.includes('location.href')) {
            link.classList.add('active');
        }
    });

    const pageTitles = {
        'overview': { title: 'Tổng quan hệ thống', sub: 'Giám sát và quản lý hạ tầng LMS' },
        'users': { title: 'Quản lý người dùng', sub: 'Tìm kiếm, thêm mới và quản lý tài khoản' },
        'courses': { title: 'Quản lý khóa học', sub: 'Cấu hình và kiểm soát nội dung khóa học' },
        'departments': { title: 'Quản lý phòng ban', sub: 'Tổ chức cơ cấu nhân sự' },
        'auditlogs': { title: 'Nhat ky hoat dong', sub: 'Theo doi bien dong va lich su he thong' },
        'jobtitles': { title: 'Quan ly Chuc Danh', sub: 'CRUD chuc danh nhan vien trong to chuc' },
        'exports': { title: 'Xuat Bao Cao Excel', sub: 'Tai xuong bao cao nhan vien, dao tao va ket qua kiem tra' }
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
    else if (page === 'exports') { /* no load needed */ }
}

async function loadOverview() {
    try {
        const [stats, activeStats] = await Promise.all([
            apiFetch('/api/it/stats'),
            apiFetch('/api/it/users/active-stats')
        ]);
        document.getElementById('itStatsGrid').innerHTML = `
            <div class="stat-card blue">
                <div class="stat-icon blue">👥</div>
                <div class="stat-value">${fmtNumber(stats.totalUsers)}</div>
                <div class="stat-label">Người dùng</div>
            </div>
            <div class="stat-card green">
                <div class="stat-icon green">🏦</div>
                <div class="stat-value">${fmtNumber(stats.totalDepartments)}</div>
                <div class="stat-label">Phòng ban</div>
            </div>
            <div class="stat-card purple">
                <div class="stat-icon purple">☁️</div>
                <div class="stat-value">${fmtNumber(stats.activeUsers)}</div>
                <div class="stat-label">Hoạt động</div>
            </div>
            <div class="stat-card orange" style="--card-accent:#f59e0b">
                <div class="stat-icon" style="background:rgba(245,158,11,.12);color:#d97706">🕒</div>
                <div class="stat-value">${fmtNumber(activeStats.recentlyActive || 0)}</div>
                <div class="stat-label">Online 30 ngày</div>
            </div>
        `;

        if (stats.userRoleDist && window.Chart) {
            const ctx = document.getElementById('userChart').getContext('2d');
            if (userChart) userChart.destroy();
            userChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(stats.userRoleDist),
                    datasets: [{ data: Object.values(stats.userRoleDist), backgroundColor: ['#3b82f6', '#10b981', '#6366f1'] }]
                },
                options: { plugins: { legend: { position: 'right' } } }
            });
        }

        const logs = await apiFetch('/api/it/auditlogs?pageSize=7');
        document.getElementById('recentLogs').innerHTML = (logs.logs || []).map(l => `
            <div class="log-item">
                <div style="font-weight:600">${l.userName}</div>
                <div style="font-size:12px;color:#64748b">${l.actionType} - ${fmtDateTime(l.createdAt)}</div>
                <div style="font-size:11px;color:#94a3b8">${l.description || ''}</div>
            </div>
        `).join('') || '<div style="padding:20px;text-align:center">Chưa có dữ liệu</div>';
    } catch(e) {
        console.error(e);
        document.getElementById('itStatsGrid').innerHTML = `<div class="card"><div class="card-body" style="color:#ef4444">Không tải được dashboard: ${e.message}</div></div>`;
        document.getElementById('recentLogs').innerHTML = `<div style="padding:20px;text-align:center;color:#ef4444">Không tải được hoạt động gần đây</div>`;
        const chartEmpty = document.getElementById('userChartEmpty');
        if (chartEmpty) chartEmpty.style.display = 'block';
    }
}

async function loadUsers(page = 1) {
    const search = document.getElementById('userSearch')?.value || '';
    try {
        const data = await apiFetch(`/api/it/users?search=${encodeURIComponent(search)}&page=${page}&pageSize=15`);
        loadedUsersList = data.users || [];
        document.getElementById('usersTable').innerHTML = loadedUsersList.map(u => `
            <tr>
                <td><input type="checkbox" class="user-check" value="${u.userId}" onchange="updateSelectedList()"></td>
                <td><strong>${u.fullName}</strong><div style="font-size:11px;color:#94a3b8">@@${u.username}</div></td>
                <td><code>${u.employeeCode || '—'}</code></td>
                <td><span class="badge badge-info">${u.department || 'N/A'}</span></td>
                <td>${statusBadge(u.status)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditModal(${u.userId})" title="Sửa">✏️</button>
                    <button class="btn btn-info btn-sm" onclick="openUserRoleModal(${u.userId})" style="padding: 6px; background:#6366f1;color:#fff;border:none" title="Role">🔐</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.userId}, '${u.username}')" style="padding: 6px;" title="Khóa/Xóa">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch(e) {}
}

async function loadAuditLogs(page = 1) {
    try {
        const data = await apiFetch(`/api/it/auditlogs?page=${page}&pageSize=15`);
        document.getElementById('fullAuditLogsTable').innerHTML = (data.logs || []).map(l => `
            <tr>
                <td>${fmtDateTime(l.createdAt)}</td>
                <td><strong>${l.userName}</strong></td>
                <td>${l.actionType}</td>
                <td>${l.description || ''}</td>
            </tr>
        `).join('');
    } catch(e) {}
}

function updateSelectedList() {
    selectedUserIds = Array.from(document.querySelectorAll('.user-check:checked')).map(cb => cb.value);
}
function toggleSelectAll(master) {
    document.querySelectorAll('.user-check').forEach(cb => cb.checked = master.checked);
    updateSelectedList();
}
function openBulkDeptModal() {
    if (selectedUserIds.length === 0) { showToast('Hãy chọn ít nhất 1 người', 'warning'); return; }
    document.getElementById('bulkCountText').textContent = `Đã chọn ${selectedUserIds.length} nhân viên.`;
    openModal('bulkDeptModal');
}
async function submitBulkDept() {
    const deptId = document.getElementById('bulkDeptSel').value;
    if (!deptId) return;
    try {
        for (let id of selectedUserIds) {
            await apiFetch(`/api/it/users/${id}`, { method: 'PUT', body: JSON.stringify({ departmentId: parseInt(deptId) }) });
        }
        showToast('Đã phân bổ thành công!');
        closeModal('bulkDeptModal');
    } catch(e) {}
}

async function submitCreateUser() {
    const body = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value || '123',
        fullName: document.getElementById('newFullName').value,
        employeeCode: document.getElementById('newEmployeeCode').value || ('NV' + Math.floor(Math.random() * 1000000)),
        email: document.getElementById('newEmail').value || (document.getElementById('newUsername').value + '@@domain.com'),
        departmentId: parseInt(document.getElementById('newDepartment').value) || null
    };
    if(!body.username) { showToast('Vui lòng nhập tên đăng nhập!', 'error'); return; }
    
    try {
        await apiFetch('/api/it/users', { method: 'POST', body: JSON.stringify(body) });
        showToast('Tạo tài khoản thành công!');
        closeModal('createUserModal');
        loadUsers(1);
    } catch(e) { }
}

let loadedUsersList = []; // Biến tạm lưu user vừa render

// Hàm mở Edit Modal
async function openEditModal(id) {
    const user = loadedUsersList.find(u => u.userId === id);
    if (!user) return;
    
    document.getElementById('editUserId').value = user.userId;
    document.getElementById('editFullName').value = user.fullName || '';
    document.getElementById('editDepartment').value = user.departmentId || '';
    document.getElementById('editStatus').value = user.status;
    document.getElementById('editPassword').value = '';
    
    openModal('editUserModal');
}

// Submit Edit
async function submitEditUser() {
    const id = document.getElementById('editUserId').value;
    const dpId = parseInt(document.getElementById('editDepartment').value);
    const body = {
        fullName: document.getElementById('editFullName').value,
        status: document.getElementById('editStatus').value,
        departmentId: isNaN(dpId) ? null : dpId,
        newPassword: document.getElementById('editPassword').value || null
    };
    
    try {
        await apiFetch(`/api/it/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        showToast('Cập nhật thành công!');
        closeModal('editUserModal');
        loadUsers(1);
    } catch(e) {
        document.getElementById('usersTable').innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ef4444">Không tải được danh sách người dùng: ${e.message}</td></tr>`;
    }
}

async function openUserRoleModal(id) {
    if (!availableRoles.length) await refreshRoles();
    const user = loadedUsersList.find(u => u.userId === id);
    if (!user) return;

    document.getElementById('userRoleUserId').value = id;
    document.getElementById('userRoleUserName').value = user.fullName || user.username || '';
    const selectedRoleIds = new Set((user.roles || []).map(r => String(r.roleId)));
    document.getElementById('userRoleSelect').innerHTML = availableRoles.map(r =>
        `<option value="${r.roleId}" ${selectedRoleIds.has(String(r.roleId)) ? 'selected' : ''}>${r.roleName}</option>`
    ).join('');
    openModal('userRoleModal');
}

async function submitUserRoles() {
    const userId = document.getElementById('userRoleUserId').value;
    const user = loadedUsersList.find(u => String(u.userId) === String(userId));
    if (!user) return;

    const selectedRoleIds = Array.from(document.getElementById('userRoleSelect').selectedOptions).map(o => parseInt(o.value));
    const currentRoleIds = new Set((user.roles || []).map(r => r.roleId));

    try {
        for (const roleId of selectedRoleIds) {
            if (!currentRoleIds.has(roleId)) {
                await apiFetch(`/api/it/users/${userId}/roles/${roleId}`, { method: 'POST' });
            }
        }

        for (const role of (user.roles || [])) {
            if (!selectedRoleIds.includes(role.roleId)) {
                await apiFetch(`/api/it/users/${userId}/roles/${role.roleId}`, { method: 'DELETE' });
            }
        }

        showToast('Cập nhật role thành công!');
        closeModal('userRoleModal');
        loadUsers();
    } catch(e) {
        showToast(e.message || 'Lỗi cập nhật role', 'error');
    }
}

// Xóa (Vô hiệu hóa)
async function deleteUser(id, username) {
    if(!confirm(`Bạn có chắc muốn vô hiệu hóa (xóa) tài khoản: ${username}?`)) return;
    try {
        await apiFetch(`/api/it/users/${id}`, { method: 'DELETE' });
        showToast('Đã vô hiệu hóa tài khoản thành công!', 'warning');
        loadUsers(1); // Load lại danh sách sau khi xóa
    } catch(e) {}
}

// ==== Courses Management ====
let loadedCoursesList = [];
async function loadItCourses() {
    const search = document.getElementById('courseSearch')?.value || '';
    try {
        const res = await apiFetch(`/api/it/courses?search=${encodeURIComponent(search)}`);
        loadedCoursesList = res.courses || res || [];
        document.getElementById('itCoursesTable').innerHTML = loadedCoursesList.map(c => `
            <tr>
                <td>${c.courseId || c.id}</td>
                <td><strong>${c.title}</strong></td>
                <td><span class="badge badge-info">${c.category || 'N/A'}</span></td>
                <td>${c.isMandatory ? '<span class="badge" style="background:#fef2f2;color:#ef4444">Bắt buộc</span>' : '<span style="color:#94a3b8">Tùy chọn</span>'}</td>
                <td>${statusBadge(c.status || 'Active')}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="openCourseContentModal(${c.courseId || c.id})" style="padding:6px;background:#3b82f6;color:white;border:none" title="Quản lý Nội dung 📂">📂 Nội dung</button>
                    <button class="btn btn-secondary btn-sm" onclick="openEditCourseModal(${c.courseId || c.id})" title="Sửa">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.courseId || c.id})" style="padding: 6px;" title="Xóa">🗑️</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center">Không có dữ liệu</td></tr>';
    } catch(e) {
        document.getElementById('itCoursesTable').innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ef4444">Không tải được khóa học: ${e.message}</td></tr>`;
    }
}
const debouncedLoadItCourses = debounce(loadItCourses, 400);

async function openCreateCourseModal() {
    if (!loadedCategoriesList.length) await loadCategories();
    document.getElementById('courseModalTitle').textContent = '➕ Thêm khóa học';
    document.getElementById('courseModalId').value = '';
    document.getElementById('courseModalTitleInput').value = '';
    document.getElementById('courseModalDesc').value = '';
    refreshCourseCategoryDropdown();
    document.getElementById('courseModalCategory').value = '';
    document.getElementById('courseModalStatus').value = 'Active';
    document.getElementById('courseModalStartDate').value = '';
    document.getElementById('courseModalEndDate').value = '';
    document.getElementById('courseModalTargetDept').value = '';
    document.getElementById('courseModalMandatory').checked = false;
    openModal('courseModal');
}

async function openEditCourseModal(id) {
    const c = loadedCoursesList.find(x => (x.courseId || x.id) == id);
    if (!c) return;
    if (!loadedCategoriesList.length) await loadCategories();
    refreshCourseCategoryDropdown(c.categoryId);
    document.getElementById('courseModalTitle').textContent = '✏️ Sửa khóa học';
    document.getElementById('courseModalId').value = id;
    document.getElementById('courseModalTitleInput').value = c.title || '';
    document.getElementById('courseModalDesc').value = c.description || '';
    document.getElementById('courseModalStatus').value = c.status || 'Active';
    document.getElementById('courseModalStartDate').value = c.startDate ? c.startDate.substring(0,10) : '';
    document.getElementById('courseModalEndDate').value = c.endDate ? c.endDate.substring(0,10) : '';
    let targetIdsStr = c.targetDepartmentIds || (c.targetDepartmentId ? c.targetDepartmentId.toString() : "");
    let targetIds = targetIdsStr.split(',').map(s => s.trim());
    Array.from(document.getElementById('courseModalTargetDept').options).forEach(o => o.selected = targetIds.includes(o.value));
    document.getElementById('courseModalMandatory').checked = !!c.isMandatory;
    openModal('courseModal');
}

async function generateWithAI() {
    const prompt = document.getElementById('aiPrompt').value;
    if (!prompt) return showToast('Vui lòng nhập chủ đề cho AI!', 'warning');
    
    const btn = document.getElementById('btnGenerateAI');
    btn.innerHTML = '✨ Đang nghĩ...';
    btn.disabled = true;
    
    try {
        // Có thể tái sử dụng endpoint của HR cho IT Admin
        const res = await apiFetch('/api/hr/ai-generate-course', { method: 'POST', body: JSON.stringify({ prompt }) });
        document.getElementById('courseModalTitleInput').value = res.title;
        document.getElementById('courseModalDesc').value = res.description;
        showToast('AI đã tạo xong nội dung!', 'success');
    } catch(e) {
        showToast('Lỗi AI: ' + e.message, 'error');
    } finally {
        btn.innerHTML = 'Tạo';
        btn.disabled = false;
    }
}

async function submitCourse() {
    const id = document.getElementById('courseModalId').value;
    const isEdit = !!id;
    const body = {
        title: document.getElementById('courseModalTitleInput').value,
        description: document.getElementById('courseModalDesc').value,
        categoryId: parseInt(document.getElementById('courseModalCategory').value) || null,
        status: document.getElementById('courseModalStatus').value,
        startDate: document.getElementById('courseModalStartDate').value || null,
        endDate: document.getElementById('courseModalEndDate').value || null,
        targetDepartmentIds: Array.from(document.getElementById('courseModalTargetDept').selectedOptions).map(o => parseInt(o.value)).filter(v => !isNaN(v)),
        isMandatory: document.getElementById('courseModalMandatory').checked
    };
    if (!body.title) { showToast('Bạn phải nhập tên khóa học!', 'error'); return; }

    try {
        if (isEdit) {
            await apiFetch(`/api/it/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) });
            showToast('Cập nhật khóa học thành công!');
        } else {
            await apiFetch(`/api/it/courses`, { method: 'POST', body: JSON.stringify(body) });
            showToast('Tạo khóa học thành công!');
        }
        closeModal('courseModal');
        loadItCourses();
    } catch(e) {
        showToast(e.message || 'Lỗi', 'error');
    }
}

function refreshCourseCategoryDropdown(selectedId) {
    const el = document.getElementById('courseModalCategory');
    if (!el) return;
    el.innerHTML = '<option value="">-- Chọn danh mục --</option>' + loadedCategoriesList.map(c =>
        `<option value="${c.categoryId}" ${String(c.categoryId) === String(selectedId || '') ? 'selected' : ''}>${c.categoryName}</option>`
    ).join('');
}

async function deleteCourse(id) {
    if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    try {
        await apiFetch(`/api/it/courses/${id}`, { method: 'DELETE' });
        showToast('Xóa thành công!', 'warning');
        loadItCourses();
    } catch(e) {
        showToast(e.message || 'Lỗi', 'error');
    }
}

// ==== Departments Management ====
let loadedDepartmentsList = [];
async function loadItDepartments() {
    try {
        const data = await apiFetch(`/api/it/departments`);
        loadedDepartmentsList = data || [];
        document.getElementById('itDepartmentsTable').innerHTML = loadedDepartmentsList.map(d => `
            <tr>
                <td>${d.departmentId}</td>
                <td><strong>${d.departmentName}</strong></td>
                <td>${d.userCount || 0} nhân viên</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditDeptModal(${d.departmentId})" title="Sửa">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteDept(${d.departmentId})" style="padding: 6px;" title="Xóa">🗑️</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="text-align:center">Không có dữ liệu</td></tr>';
    } catch(e) {
        document.getElementById('itDepartmentsTable').innerHTML = `<tr><td colspan="4" style="text-align:center;color:#ef4444">Không tải được phòng ban: ${e.message}</td></tr>`;
    }
}

function openCreateDeptModal() {
    document.getElementById('deptModalTitle').textContent = '➕ Thêm phòng ban';
    document.getElementById('deptModalId').value = '';
    document.getElementById('deptModalName').value = '';
    openModal('deptModal');
}

function openEditDeptModal(id) {
    const d = loadedDepartmentsList.find(x => x.departmentId == id);
    if (!d) return;
    document.getElementById('deptModalTitle').textContent = '✏️ Sửa phòng ban';
    document.getElementById('deptModalId').value = id;
    document.getElementById('deptModalName').value = d.departmentName || '';
    openModal('deptModal');
}

async function submitDepartment() {
    const id = document.getElementById('deptModalId').value;
    const isEdit = !!id;
    const body = {
        departmentName: document.getElementById('deptModalName').value
    };
    if (!body.departmentName) { showToast('Bạn phải nhập tên phòng ban!', 'error'); return; }

    try {
        if (isEdit) {
            await apiFetch(`/api/it/departments/${id}`, { method: 'PUT', body: JSON.stringify(body) });
            showToast('Cập nhật phòng ban thành công!');
        } else {
            await apiFetch(`/api/it/departments`, { method: 'POST', body: JSON.stringify(body) });
            showToast('Tạo phòng ban thành công!');
        }
        closeModal('deptModal');
        loadItDepartments();
        refreshDepartmentsDropdown();
    } catch(e) {
        showToast(e.message || 'Lỗi', 'error');
    }
}

async function deleteDept(id) {
    if (!confirm('Bạn có chắc muốn xóa phòng ban này?')) return;
    try {
        await apiFetch(`/api/it/departments/${id}`, { method: 'DELETE' });
        showToast('Xóa thành công!', 'warning');
        loadItDepartments();
        refreshDepartmentsDropdown();
    } catch(e) {
         showToast(e.message || 'Lỗi', 'error');
    }
}

// ==== Course Content Management ====
let currentContentCourseId = null;
let currentCourseContentParams = { modules: [], exams: [] };

function openCourseContentModal(courseId) {
    currentContentCourseId = courseId;
    document.getElementById('contentCourseId').value = courseId;
    document.getElementById('contentEmptyState').style.display = 'block';
    document.getElementById('contentActiveState').style.display = 'none';
    openModal('courseContentModal');
    loadCourseContent();
}

async function loadCourseContent() {
    if (!currentContentCourseId) return;
    try {
        const data = await apiFetch(`/api/it/courses/${currentContentCourseId}/content`);
        currentCourseContentParams = data;
        
        let modHtml = '';
        if (data.modules && data.modules.length > 0) {
            data.modules.forEach(m => {
                modHtml += `<li style="padding:10px; background:#f1f5f9; border-radius:4px; cursor:pointer;" onclick="renderModuleDetails(${m.moduleId})">
                    <strong>🎬 ${m.title}</strong>
                    <div style="font-size:11px;color:#64748b">${m.lessons?.length || 0} bài học</div>
                </li>`;
            });
        } else {
            modHtml = '<div style="font-size:12px; color:#94a3b8">Chưa có chương nào</div>';
        }
        document.getElementById('moduleList').innerHTML = modHtml;
        
        let examHtml = '';
        if (data.exams && data.exams.length > 0) {
            data.exams.forEach(e => {
                examHtml += `<li style="padding:10px; background:#fefce8; border:1px solid #fef08a; border-radius:4px; cursor:pointer;" onclick="renderExamDetails(${e.examId}, '${e.examTitle.replace(/'/g, "\\'")}')">
                    <strong>📝 ${e.examTitle}</strong>
                    <div style="font-size:11px;color:#64748b">${e.durationMinutes} phút | Đỗ: ${e.passScore}</div>
                </li>`;
            });
        } else {
            examHtml = '<div style="font-size:12px; color:#94a3b8">Chưa có bài kiểm tra</div>';
        }
        document.getElementById('examList').innerHTML = examHtml;
    } catch(e) {
        showToast('Lỗi tải nội dung: ' + e.message, 'error');
    }
}

function renderModuleDetails(moduleId) {
    document.getElementById('contentEmptyState').style.display = 'none';
    const activeState = document.getElementById('contentActiveState');
    activeState.style.display = 'block';
    
    const mod = currentCourseContentParams.modules.find(m => m.moduleId === moduleId);
    if (!mod) return;
    
    let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
        <h2 style="margin:0; font-size:18px;">Chương: ${mod.title}</h2>
        <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="openEditModuleModal(${mod.moduleId})">✏️ Sửa chương</button>
            <button class="btn btn-danger btn-sm" onclick="deleteModule(${mod.moduleId})">🗑️ Xóa chương</button>
            <button class="btn btn-primary btn-sm" onclick="openLessonModal(${mod.moduleId})">➕ Thêm Bài Học</button>
        </div>
    </div>`;
    
    if (mod.lessons && mod.lessons.length > 0) {
        let lhtml = '<table class="data-table"><thead><tr><th style="width:50px">Icon</th><th>Tên bài</th><th style="width:100px">Loại</th><th style="width:150px">Thao tác</th></tr></thead><tbody>';
        mod.lessons.forEach(l => {
            const icon = l.contentType === 'Video' ? '▶️' : '📄';
            lhtml += `<tr>
                <td style="text-align:center">${icon}</td>
                <td><strong>${l.title}</strong></td>
                <td><span class="badge ${l.contentType === 'Video' ? 'badge-info' : 'badge-purple'}">${l.contentType}</span></td>
                <td style="display:flex;gap:6px">
                    <button class="btn btn-secondary btn-sm" onclick="openEditLessonModal(${l.lessonId})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteLesson(${l.lessonId})">🗑️</button>
                </td>
            </tr>`;
        });
        lhtml += '</tbody></table>';
        html += lhtml;
    } else {
        html += `<div style="text-align:center; padding:30px; background:#f8fafc; color:#94a3b8; border-radius:4px;">Chưa có bài học nào trong chương này. Nhấn "Thêm Bài Học" để bổ sung Video hoặc Tài liệu.</div>`;
    }
    
    activeState.innerHTML = html;
}

function openModuleModal() {
    document.getElementById('moduleTitleInput').value = '';
    openModal('moduleModal');
}

async function submitModule() {
    const title = document.getElementById('moduleTitleInput').value;
    if (!title) { showToast('Nhập tên chương!', 'error'); return; }
    try {
        await apiFetch(`/api/it/courses/${currentContentCourseId}/modules`, { method: 'POST', body: JSON.stringify({ title, sortOrder: currentCourseContentParams.modules.length }) });
        closeModal('moduleModal');
        showToast('Thêm chương thành công!');
        loadCourseContent();
    } catch(e) { }
}

function openLessonModal(moduleId) {
    document.getElementById('lessonModuleId').value = moduleId;
    document.getElementById('lessonTitleInput').value = '';
    document.getElementById('lessonTypeInput').value = 'Video';
    document.getElementById('lessonVideoInput').value = '';
    document.getElementById('lessonBodyInput').value = '';
    openModal('lessonModal');
}

async function submitLesson() {
    const moduleId = document.getElementById('lessonModuleId').value;
    const body = {
        title: document.getElementById('lessonTitleInput').value,
        contentType: document.getElementById('lessonTypeInput').value,
        videoUrl: document.getElementById('lessonVideoInput').value,
        contentBody: document.getElementById('lessonBodyInput').value
    };
    if (!body.title) { showToast('Nhập tên bài học!', 'error'); return; }
    try {
        await apiFetch(`/api/it/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(body) });
        closeModal('lessonModal');
        showToast('Thêm bài học thành công!');
        loadCourseContent();
        renderModuleDetails(parseInt(moduleId));
    } catch(e) {}
}

async function deleteLesson(lessonId) {
    if (!confirm('Xóa bài học này?')) return;
    try {
        await apiFetch(`/api/it/lessons/${lessonId}`, { method: 'DELETE' });
        showToast('Đã xóa', 'warning');
        loadCourseContent();
        document.getElementById('contentActiveState').style.display = 'none';
        document.getElementById('contentEmptyState').style.display = 'block';
    } catch(e) {
        document.getElementById('fullAuditLogsTable').innerHTML = `<tr><td colspan="4" style="text-align:center;color:#ef4444">Không tải được nhật ký hoạt động: ${e.message}</td></tr>`;
    }
}

function openEditLessonModal(lessonId) {
    const lesson = currentCourseContentParams.modules.flatMap(m => m.lessons || []).find(l => l.lessonId === lessonId);
    if (!lesson) return;

    document.getElementById('editLessonId').value = lessonId;
    document.getElementById('editLessonTitleInput').value = lesson.title || '';
    document.getElementById('editLessonTypeInput').value = lesson.contentType || 'Video';
    document.getElementById('editLessonVideoInput').value = lesson.videoUrl || '';
    document.getElementById('editLessonBodyInput').value = lesson.contentBody || '';
    openModal('editLessonModal');
}

async function submitEditLesson() {
    const lessonId = document.getElementById('editLessonId').value;
    const body = {
        title: document.getElementById('editLessonTitleInput').value,
        contentType: document.getElementById('editLessonTypeInput').value,
        videoUrl: document.getElementById('editLessonVideoInput').value,
        contentBody: document.getElementById('editLessonBodyInput').value
    };
    if (!body.title) { showToast('Nhập tên bài học!', 'error'); return; }

    try {
        await apiFetch(`/api/it/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(body) });
        closeModal('editLessonModal');
        showToast('Cập nhật bài học thành công!');
        await loadCourseContent();
    } catch(e) {
        showToast(e.message || 'Lỗi cập nhật bài học', 'error');
    }
}

function openExamModal() {
    document.getElementById('examTitleInput').value = '';
    openModal('examModal');
}

async function submitExam() {
    const body = {
        examTitle: document.getElementById('examTitleInput').value,
        durationMinutes: parseInt(document.getElementById('examDurationInput').value) || 30,
        passScore: parseFloat(document.getElementById('examPassScoreInput').value) || 50
    };
    if (!body.examTitle) { showToast('Yêu cầu nhập tên bài kiểm tra!', 'error'); return; }
    try {
        await apiFetch(`/api/it/courses/${currentContentCourseId}/exams`, { method: 'POST', body: JSON.stringify(body) });
        closeModal('examModal');
        showToast('Tạo bài kiểm tra thành công!');
        loadCourseContent();
    } catch(e) {}
}

async function renderExamDetails(examId, title) {
    document.getElementById('contentEmptyState').style.display = 'none';
    const activeState = document.getElementById('contentActiveState');
    activeState.style.display = 'block';
    
    activeState.innerHTML = `<div style="text-align:center; padding:30px; color:#94a3b8">Đang tải câu hỏi...</div>`;
    
    try {
        const questions = await apiFetch(`/api/it/exams/${examId}/questions`);
        let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
            <h2 style="margin:0; font-size:18px;">Quiz: ${title}</h2>
            <div style="display:flex;gap:8px">
                <button class="btn btn-secondary btn-sm" onclick="openEditExamModal(${examId})">✏️ Sửa</button>
                <button class="btn btn-danger btn-sm" onclick="deleteExam(${examId})">🗑️ Xóa</button>
                <button class="btn btn-primary btn-sm" onclick="openQuestionModal(${examId})">➕ Thêm Câu Hỏi</button>
            </div>
        </div>`;
        
        if (questions && questions.length > 0) {
            let qhtml = '<ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:15px;">';
            questions.forEach((q, idx) => {
                let optionsHtml = '';
                if(q.options) {
                    optionsHtml = '<div style="margin-top:8px; display:grid; grid-template-columns:1fr 1fr; gap:5px;">';
                    q.options.forEach(o => {
                        optionsHtml += `<div style="padding:4px 8px; border-radius:4px; font-size:13px; ${o.isCorrect ? 'background:#dcfce7;color:#166534;font-weight:bold;' : 'background:#f1f5f9;color:#475569;'}">${o.isCorrect ? '✔️' : '⚪'} ${o.optionText}</div>`;
                    });
                    optionsHtml += '</div>';
                }
                qhtml += `<li style="padding:15px; border:1px solid #e2e8f0; border-radius:8px; background:#f8fafc; position:relative;">
                    <div style="font-weight:bold; color:#1e293b; margin-bottom:5px;">Câu ${idx+1}: <span style="font-weight:normal">${q.questionText}</span></div>
                    <div style="font-size:12px; color:#3b82f6; margin-bottom:5px;">Điểm: ${q.points}</div>
                    ${optionsHtml}
                    <button class="btn btn-danger btn-sm" style="position:absolute; top:10px; right:10px;" onclick="deleteQuestion(${examId}, ${q.questionId})">Xóa</button>
                </li>`;
            });
            qhtml += '</ul>';
            html += qhtml;
        } else {
            html += `<div style="text-align:center; padding:30px; background:#f8fafc; color:#94a3b8; border-radius:4px;">Chưa có câu hỏi nào. Bạn hãy nhấn Thêm.</div>`;
        }
        activeState.innerHTML = html;
    } catch(e) {
        activeState.innerHTML = `<div style="color:red">Lỗi: ${e.message}</div>`;
    }
}

function openQuestionModal(examId) {
    document.getElementById('questionExamId').value = examId;
    document.getElementById('qTextInput').value = '';
    document.getElementById('qPointsInput').value = '10';
    document.getElementById('qOpt1').value = '';
    document.getElementById('qOpt2').value = '';
    document.getElementById('qOpt3').value = '';
    document.getElementById('qOpt4').value = '';
    openModal('questionModal');
}

async function submitQuestion() {
    const examId = document.getElementById('questionExamId').value;
    const correctVal = document.querySelector('input[name="qCorrectOption"]:checked').value;
    const body = {
        questionText: document.getElementById('qTextInput').value,
        points: parseFloat(document.getElementById('qPointsInput').value) || 10,
        options: []
    };
    
    if (!body.questionText) { showToast('Yêu cầu nhập nội dung!', 'error'); return; }
    
    for (let i = 1; i <= 4; i++) {
        const text = document.getElementById('qOpt' + i).value;
        if (text.trim() !== "") {
            body.options.push({ optionText: text, isCorrect: (correctVal == i) });
        }
    }
    
    if (body.options.length < 2) { showToast('Yêu cầu ít nhất 2 đáp án!', 'error'); return; }
    
    try {
        await apiFetch(`/api/it/exams/${examId}/questions`, { method: 'POST', body: JSON.stringify(body) });
        closeModal('questionModal');
        showToast('Câu Hỏi đã được thêm!');
        renderExamDetails(examId, 'Loading...'); 
        setTimeout(() => loadCourseContent(), 500); // Reload exam structure quietly
    } catch(e) {}
}

async function deleteQuestion(examId, questionId) {
    if (!confirm('Xóa câu hỏi này?')) return;
    try {
        await apiFetch(`/api/it/exams/${examId}/questions/${questionId}`, { method: 'DELETE' });
        showToast('Đã xóa', 'warning');
        renderExamDetails(examId, 'Loading...');
    } catch(e) {}
}

const debouncedLoadUsers = debounce(() => loadUsers(1), 400);

// Cập nhật pageTitles + navigate() để nhận 6 trang mới
const extPageTitles = {
    'categories': { title: 'Quản lý danh mục', sub: 'CRUD danh mục khóa học, FAQ và ngân hàng câu hỏi' },
    'faqs': { title: 'Quản lý FAQ', sub: 'Câu hỏi thường gặp' },
    'analytics': { title: 'Phân tích nâng cao', sub: 'Biểu đồ thống kê chi tiết toàn hệ thống' },
    'backup': { title: 'Backup hệ thống', sub: 'Tạo và theo dõi lịch sử sao lưu dữ liệu' },
    'permissions': { title: 'Phân quyền', sub: 'Xem và quản lý quyền hạn theo role' },
    'newsletter': { title: 'Newsletter', sub: 'Quản lý đăng ký nhận thông báo' },
    'settings': { title: 'Cài đặt hệ thống', sub: 'Quản lý tham số cấu hình LMS' }
};

const _origNavigate = navigate;
function navigate(page) {
    if (extPageTitles[page]) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const oc = link.getAttribute('onclick');
            if (oc && oc.includes(`navigate('${page}')`)) link.classList.add('active');
        });
        const ti = document.getElementById('pageTitle');
        const su = document.getElementById('pageSubtitle');
        if (ti) ti.textContent = extPageTitles[page].title;
        if (su) su.textContent = extPageTitles[page].sub;
        document.querySelectorAll('.page-section').forEach(s => s.style.display = s.id === page ? '' : 'none');
        if (page === 'categories') loadCategories();
        else if (page === 'faqs') loadFaqs();
        else if (page === 'analytics') loadAnalytics();
        else if (page === 'backup') loadBackupLogs();
        else if (page === 'permissions') loadPermissions();
        else if (page === 'newsletter') loadNewsletter();
        else if (page === 'settings') loadSettings();
    } else {
        _origNavigate(page);
    }
}

// ============================================================
// CATEGORIES
// ============================================================
let loadedCategoriesList = [];
async function loadCategories() {
    try {
        const cats = await apiFetch('/api/it/categories');
        loadedCategoriesList = cats || [];
        document.getElementById('categoriesTable').innerHTML = loadedCategoriesList.map(c => `
            <tr>
                <td>${c.categoryId}</td>
                <td><strong>${c.categoryName}</strong></td>
                <td><span class="badge badge-info">${c.courseCount}</span></td>
                <td>${c.faqCount}</td>
                <td>${c.questionBankCount}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditCategoryModal(${c.categoryId})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.categoryId}, '${(c.categoryName||'').replace(/'/g,"\\'")}')" style="padding:6px">🗑️</button>
                </td>
            </tr>`).join('') || '<tr><td colspan="6" style="text-align:center">Chưa có danh mục nào</td></tr>';

        // Cập nhật dropdown FAQ và categoryModal
        refreshCourseCategoryDropdown();
    } catch(e) {
        document.getElementById('categoriesTable').innerHTML = '<tr><td colspan="6" style="color:red">Lỗi tải dữ liệu</td></tr>';
    }
}

function openCreateCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = '➕ Thêm danh mục';
    document.getElementById('categoryModalId').value = '';
    document.getElementById('categoryModalName').value = '';
    const sel = document.getElementById('categoryModalDept');
    sel.innerHTML = '<option value="">-- Không có --</option>' + departments.map(d => `<option value="${d.departmentId}">${d.departmentName}</option>`).join('');
    openModal('categoryModal');
}

function openEditCategoryModal(id) {
    const c = loadedCategoriesList.find(x => x.categoryId == id);
    if (!c) return;
    document.getElementById('categoryModalTitle').textContent = '✏️ Sửa danh mục';
    document.getElementById('categoryModalId').value = id;
    document.getElementById('categoryModalName').value = c.categoryName || '';
    const sel = document.getElementById('categoryModalDept');
    sel.innerHTML = '<option value="">-- Không có --</option>' + departments.map(d => `<option value="${d.departmentId}" ${d.departmentId == c.ownerDeptId ? 'selected' : ''}>${d.departmentName}</option>`).join('');
    openModal('categoryModal');
}

async function submitCategory() {
    const id = document.getElementById('categoryModalId').value;
    const body = {
        categoryName: document.getElementById('categoryModalName').value,
        ownerDeptId: parseInt(document.getElementById('categoryModalDept').value) || null
    };
    if (!body.categoryName) { showToast('Nhập tên danh mục!', 'error'); return; }
    try {
        if (id) {
            await apiFetch(`/api/it/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });
            showToast('Cập nhật danh mục thành công!');
        } else {
            await apiFetch('/api/it/categories', { method: 'POST', body: JSON.stringify(body) });
            showToast('Thêm danh mục thành công!');
        }
        closeModal('categoryModal');
        loadCategories();
        refreshDepartmentsDropdown();
    } catch(e) { showToast(e.message || 'Lỗi', 'error'); }
}

async function deleteCategory(id, name) {
    if (!confirm(`Xóa danh mục "${name}"?`)) return;
    try {
        await apiFetch(`/api/it/categories/${id}`, { method: 'DELETE' });
        showToast('Đã xóa!', 'warning');
        loadCategories();
    } catch(e) { showToast(e.message || 'Lỗi', 'error'); }
}

// ============================================================
// FAQS
// ============================================================
let loadedFaqsList = [];
async function loadFaqs() {
    const search = document.getElementById('faqSearch')?.value || '';
    try {
        const faqs = await apiFetch(`/api/it/faqs?search=${encodeURIComponent(search)}`);
        loadedFaqsList = faqs || [];
        document.getElementById('faqsTable').innerHTML = loadedFaqsList.map(f => `
            <tr>
                <td style="max-width:280px"><strong>${f.question}</strong></td>
                <td style="max-width:300px;color:#475569;font-size:13px">${(f.answer||'').substring(0,120)}${f.answer && f.answer.length>120?'...':''}</td>
                <td><span class="badge badge-info">${f.categoryName}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditFaqModal(${f.faqId})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteFaq(${f.faqId})" style="padding:6px">🗑️</button>
                </td>
            </tr>`).join('') || '<tr><td colspan="4" style="text-align:center">Chưa có FAQ nào</td></tr>';
    } catch(e) {
        document.getElementById('faqsTable').innerHTML = '<tr><td colspan="4" style="color:red">Lỗi tải dữ liệu</td></tr>';
    }
}
const debouncedLoadFaqs = debounce(() => loadFaqs(), 400);

async function openCreateFaqModal() {
    document.getElementById('faqModalTitle').textContent = '➕ Thêm FAQ';
    document.getElementById('faqModalId').value = '';
    document.getElementById('faqModalQ').value = '';
    document.getElementById('faqModalA').value = '';
    await refreshFaqCatDropdown();
    openModal('faqModal');
}

async function openEditFaqModal(id) {
    const f = loadedFaqsList.find(x => x.faqId == id);
    if (!f) return;
    document.getElementById('faqModalTitle').textContent = '✏️ Sửa FAQ';
    document.getElementById('faqModalId').value = id;
    document.getElementById('faqModalQ').value = f.question || '';
    document.getElementById('faqModalA').value = f.answer || '';
    await refreshFaqCatDropdown(f.categoryId);
    openModal('faqModal');
}

async function refreshFaqCatDropdown(selectedId) {
    try {
        if (!loadedCategoriesList.length) await loadCategories();
        const opts = '<option value="">-- Chọn danh mục --</option>' + loadedCategoriesList.map(c =>
            `<option value="${c.categoryId}" ${c.categoryId == selectedId ? 'selected' : ''}>${c.categoryName}</option>`).join('');
        document.getElementById('faqModalCat').innerHTML = opts;
    } catch(e) {}
}

async function submitFaq() {
    const id = document.getElementById('faqModalId').value;
    const body = {
        question: document.getElementById('faqModalQ').value,
        answer: document.getElementById('faqModalA').value,
        categoryId: parseInt(document.getElementById('faqModalCat').value) || null
    };
    if (!body.question) { showToast('Nhập câu hỏi!', 'error'); return; }
    try {
        if (id) {
            await apiFetch(`/api/it/faqs/${id}`, { method: 'PUT', body: JSON.stringify(body) });
            showToast('Cập nhật FAQ thành công!');
        } else {
            await apiFetch('/api/it/faqs', { method: 'POST', body: JSON.stringify(body) });
            showToast('Thêm FAQ thành công!');
        }
        closeModal('faqModal');
        loadFaqs();
    } catch(e) { showToast(e.message || 'Lỗi', 'error'); }
}

async function deleteFaq(id) {
    if (!confirm('Xóa FAQ này?')) return;
    try {
        await apiFetch(`/api/it/faqs/${id}`, { method: 'DELETE' });
        showToast('Đã xóa!', 'warning');
        loadFaqs();
    } catch(e) { showToast(e.message || 'Lỗi', 'error'); }
}

// ============================================================
// ANALYTICS
// ============================================================
let analyticsCharts = {};
async function loadAnalytics() {
    try {
        const data = await apiFetch('/api/it/analytics');

        // Chart: User by dept
        if (data.userByDept && data.userByDept.length) {
            const ctx1 = document.getElementById('deptChart').getContext('2d');
            if (analyticsCharts.dept) analyticsCharts.dept.destroy();
            analyticsCharts.dept = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: data.userByDept.map(d => d.department),
                    datasets: [{ label: 'Nhân viên', data: data.userByDept.map(d => d.userCount),
                        backgroundColor: '#3b82f6', borderRadius: 6 }]
                },
                options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
        }

        // Chart: Course by category (doughnut)
        if (data.courseByCategory && data.courseByCategory.length) {
            const ctx2 = document.getElementById('catChart').getContext('2d');
            if (analyticsCharts.cat) analyticsCharts.cat.destroy();
            analyticsCharts.cat = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: data.courseByCategory.map(c => c.category),
                    datasets: [{ data: data.courseByCategory.map(c => c.courseCount),
                        backgroundColor: ['#3b82f6','#10b981','#f59e0b','#6366f1','#ef4444','#06b6d4'] }]
                },
                options: { plugins: { legend: { position: 'right' } } }
            });
        }

        // Chart: Enrollment by month (line)
        if (data.enrollmentByMonth && data.enrollmentByMonth.length) {
            const ctx3 = document.getElementById('enrollChart').getContext('2d');
            if (analyticsCharts.enroll) analyticsCharts.enroll.destroy();
            analyticsCharts.enroll = new Chart(ctx3, {
                type: 'line',
                data: {
                    labels: data.enrollmentByMonth.map(e => `${e.month}/${e.year}`),
                    datasets: [{ label: 'Lượt đăng ký', data: data.enrollmentByMonth.map(e => e.count),
                        borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 }]
                },
                options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
        }

        // Chart: Pass/Fail (doughnut)
        const es = data.examStats;
        if (es && es.total > 0) {
            const ctx4 = document.getElementById('examChart').getContext('2d');
            if (analyticsCharts.exam) analyticsCharts.exam.destroy();
            analyticsCharts.exam = new Chart(ctx4, {
                type: 'doughnut',
                data: {
                    labels: ['Đạt', 'Không đạt'],
                    datasets: [{ data: [es.passed, es.failed], backgroundColor: ['#10b981', '#ef4444'] }]
                },
                options: { plugins: { legend: { position: 'bottom' } } }
            });
            document.getElementById('examStatText').textContent = `Tỉ lệ pass: ${es.passRate}% (${es.passed}/${es.total} lượt thi)`;
        } else {
            document.getElementById('examStatText').textContent = 'Chưa có dữ liệu thi';
        }

        // Top courses table
        document.getElementById('topCoursesTable').innerHTML = (data.topCourses || []).map((c, i) =>
            `<tr><td><strong>#${i+1}</strong></td><td>${c.title}</td><td><span class="badge badge-info">${c.enrollments} học viên</span></td></tr>`
        ).join('') || '<tr><td colspan="3" style="text-align:center">Chưa có dữ liệu</td></tr>';
    } catch(e) { showToast('Lỗi tải analytics: ' + e.message, 'error'); }
}

// ============================================================
// BACKUP
// ============================================================
async function loadBackupLogs() {
    try {
        const logs = await apiFetch('/api/it/backuplogs');
        document.getElementById('backupLogsTable').innerHTML = (logs || []).map(b => `
            <tr>
                <td>${b.backupId}</td>
                <td><code style="font-size:12px">${b.fileName}</code></td>
                <td><span class="badge ${b.backupType==='Full'?'badge-info':b.backupType==='Incremental'?'badge-purple':'badge-green'}">${b.backupType}</span></td>
                <td>${fmtDateTime(b.createdAt)}</td>
            </tr>`).join('') || '<tr><td colspan="4" style="text-align:center">Chưa có bản backup nào</td></tr>';
    } catch(e) {
        document.getElementById('backupLogsTable').innerHTML = '<tr><td colspan="4" style="color:red">Lỗi tải dữ liệu</td></tr>';
    }
}

async function createBackup() {
    const backupType = document.getElementById('backupTypeSelect').value;
    const msgEl = document.getElementById('backupMsg');
    msgEl.textContent = '⏳ Đang tạo backup...';
    try {
        const res = await apiFetch('/api/it/backuplogs', { method: 'POST', body: JSON.stringify({ backupType }) });
        msgEl.textContent = `✅ Backup thành công! File: ${res.fileName}`;
        showToast('Tạo backup thành công!', 'success');
        loadBackupLogs();
    } catch(e) {
        msgEl.textContent = '❌ Lỗi: ' + e.message;
        showToast('Lỗi tạo backup: ' + e.message, 'error');
    }
}

// ============================================================
// PERMISSIONS
// ============================================================
async function loadPermissions() {
    try {
        if (!availableRoles.length) await refreshRoles();
        loadedPermissions = await apiFetch('/api/it/permissions');
        document.getElementById('permissionsTable').innerHTML = (loadedPermissions || []).map(p => `
            <tr>
                <td>${p.permissionId}</td>
                <td><code>${p.permissionKey}</code></td>
                <td>${p.description || '—'}</td>
                <td>${(p.roles || []).map(r => `<span class="badge badge-purple">${r.roleName}</span>`).join(' ') || '<span style="color:#94a3b8">Chưa gán</span>'}</td>
                <td><button class="btn btn-secondary btn-sm" onclick="openPermissionModal(${p.permissionId})">✏️</button></td>
            </tr>`).join('') || '<tr><td colspan="5" style="text-align:center">Chưa có quyền hạn nào được định nghĩa</td></tr>';
    } catch(e) {
        document.getElementById('permissionsTable').innerHTML = '<tr><td colspan="5" style="color:red">Lỗi tải dữ liệu</td></tr>';
    }
}

async function openPermissionModal(permissionId) {
    if (!availableRoles.length) await refreshRoles();
    const permission = loadedPermissions.find(p => p.permissionId === permissionId);
    if (!permission) return;

    document.getElementById('permissionModalId').value = permissionId;
    document.getElementById('permissionModalKey').value = permission.permissionKey || '';
    const selected = new Set((permission.roles || []).map(r => String(r.roleId)));
    document.getElementById('permissionModalRoles').innerHTML = availableRoles.map(r =>
        `<option value="${r.roleId}" ${selected.has(String(r.roleId)) ? 'selected' : ''}>${r.roleName}</option>`
    ).join('');
    openModal('permissionModal');
}

async function submitPermissionRoles() {
    const permissionId = document.getElementById('permissionModalId').value;
    const roleIds = Array.from(document.getElementById('permissionModalRoles').selectedOptions).map(o => parseInt(o.value));

    try {
        await apiFetch(`/api/it/permissions/${permissionId}`, { method: 'PUT', body: JSON.stringify({ roleIds }) });
        closeModal('permissionModal');
        showToast('Cập nhật quyền thành công!');
        loadPermissions();
    } catch(e) {
        showToast(e.message || 'Lỗi cập nhật quyền', 'error');
    }
}

// ============================================================
// NEWSLETTER
// ============================================================
async function loadNewsletter() {
    try {
        const data = await apiFetch('/api/it/newsletter');
        const subs = data.subscriptions || [];

        document.getElementById('newsletterStats').innerHTML = `
            <div class="stat-card blue"><div class="stat-icon blue">📧</div><div class="stat-value">${data.total}</div><div class="stat-label">Tổng đăng ký</div></div>
            <div class="stat-card green"><div class="stat-icon green">✅</div><div class="stat-value">${data.subscribed}</div><div class="stat-label">Đang đăng ký</div></div>
            <div class="stat-card red" style="--card-accent:#ef4444"><div class="stat-icon" style="background:rgba(239,68,68,.12);color:#ef4444">🚫</div><div class="stat-value">${data.unsubscribed}</div><div class="stat-label">Đã huỷ</div></div>
        `;

        document.getElementById('newsletterTable').innerHTML = subs.map(s => `
            <tr>
                <td><strong>${s.fullName}</strong></td>
                <td>${s.email || '—'}</td>
                <td>${s.isSubscribed ? '<span class="badge badge-green">Đang đăng ký</span>' : '<span class="badge" style="background:#fef2f2;color:#ef4444">Đã huỷ</span>'}</td>
                <td>
                    <button class="btn btn-sm ${s.isSubscribed?'btn-danger':'btn-primary'}" onclick="toggleNewsletter(${s.subId}, ${!s.isSubscribed})">
                        ${s.isSubscribed ? '🚫 Huỷ' : '✅ Kích hoạt'}
                    </button>
                </td>
            </tr>`).join('') || '<tr><td colspan="4" style="text-align:center">Chưa có đăng ký nào</td></tr>';
    } catch(e) {
        document.getElementById('newsletterTable').innerHTML = '<tr><td colspan="4" style="color:red">Lỗi tải dữ liệu</td></tr>';
    }
}

async function toggleNewsletter(subId, newStatus) {
    try {
        await apiFetch(`/api/it/newsletter/${subId}`, { method: 'PUT', body: JSON.stringify({ isSubscribed: newStatus }) });
        showToast(newStatus ? 'Đã kích hoạt!' : 'Đã huỷ đăng ký!', 'success');
        loadNewsletter();
    } catch(e) { showToast(e.message || 'Lỗi', 'error'); }
}

async function loadSettings() {
    try {
        loadedSettings = await apiFetch('/api/it/settings');
        document.getElementById('settingsTable').innerHTML = (loadedSettings || []).map(s => `
            <tr>
                <td><code>${s.settingKey}</code></td>
                <td style="max-width:420px">${(s.settingValue || '').substring(0, 140)}${s.settingValue && s.settingValue.length > 140 ? '...' : ''}</td>
                <td>${s.modifiedAt ? fmtDateTime(s.modifiedAt) : '—'}</td>
                <td><button class="btn btn-secondary btn-sm" onclick="openSettingModal('${(s.settingKey || '').replace(/'/g, "\\'")}')">✏️</button></td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="text-align:center">Chưa có cài đặt nào</td></tr>';
    } catch(e) {
        document.getElementById('settingsTable').innerHTML = '<tr><td colspan="4" style="color:red">Lỗi tải dữ liệu</td></tr>';
    }
}

function openSettingModal(settingKey) {
    const setting = loadedSettings.find(s => s.settingKey === settingKey);
    if (!setting) return;

    document.getElementById('settingModalKey').value = setting.settingKey;
    document.getElementById('settingModalLabel').value = setting.settingKey;
    document.getElementById('settingModalValue').value = setting.settingValue || '';
    openModal('settingModal');
}

async function submitSetting() {
    const key = document.getElementById('settingModalKey').value;
    const value = document.getElementById('settingModalValue').value;
    try {
        await apiFetch(`/api/it/settings/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify(value) });
        closeModal('settingModal');
        showToast('Lưu cài đặt thành công!');
        loadSettings();
    } catch(e) {
        showToast(e.message || 'Lỗi cập nhật cài đặt', 'error');
    }
}

// ============================================================
// MODULE - EDIT & DELETE
// ============================================================
function openEditModuleModal(moduleId) {
    const mod = currentCourseContentParams.modules.find(m => m.moduleId === moduleId);
    if (!mod) return;
    document.getElementById('editModuleId').value = moduleId;
    document.getElementById('editModuleTitleInput').value = mod.title || '';
    openModal('editModuleModal');
}

async function submitEditModule() {
    const id = document.getElementById('editModuleId').value;
    const title = document.getElementById('editModuleTitleInput').value;
    if (!title) { showToast('Nhập tên chương!', 'error'); return; }
    try {
        await apiFetch(`/api/it/modules/${id}`, { method: 'PUT', body: JSON.stringify({ title }) });
        closeModal('editModuleModal');
        showToast('Sửa chương thành công!');
        loadCourseContent();
    } catch(e) { showToast(e.message || 'Lỗi', 'error'); }
}

async function deleteModule(moduleId) {
    if (!confirm('Xóa chương này và toàn bộ bài học bên trong?')) return;
    try {
        await apiFetch(`/api/it/modules/${moduleId}`, { method: 'DELETE' });
        showToast('Đã xóa chương!', 'warning');
        loadCourseContent();
        document.getElementById('contentActiveState').style.display = 'none';
        document.getElementById('contentEmptyState').style.display = 'block';
    } catch(e) { showToast(e.message || 'Lỗi', 'error'); }
}

// ============================================================
// EXAM - EDIT & DELETE
// ============================================================
function openEditExamModal(examId) {
    const exam = currentCourseContentParams.exams.find(e => e.examId === examId);
    if (!exam) return;
    document.getElementById('editExamId').value = examId;
    document.getElementById('editExamTitleInput').value = exam.examTitle || '';
    document.getElementById('editExamDurationInput').value = exam.durationMinutes || 30;
    document.getElementById('editExamPassScoreInput').value = exam.passScore || 50;
    openModal('editExamModal');
}

async function submitEditExam() {
    const id = document.getElementById('editExamId').value;
    const body = {
        examTitle: document.getElementById('editExamTitleInput').value,
        durationMinutes: parseInt(document.getElementById('editExamDurationInput').value) || 30,
        passScore: parseFloat(document.getElementById('editExamPassScoreInput').value) || 50
    };
    if (!body.examTitle) { showToast('Nhập tên bài kiểm tra!', 'error'); return; }
    try {
        await apiFetch(`/api/it/exams/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        closeModal('editExamModal');
        showToast('Cập nhật bài kiểm tra thành công!');
        loadCourseContent();
    } catch(e) { showToast(e.message || 'Lỗi', 'error'); }
}

async function deleteExam(examId) {
    if (!confirm('Xóa bài kiểm tra này? Toàn bộ câu hỏi và lịch sử thi sẽ bị xóa.')) return;
    try {
        await apiFetch(`/api/it/exams/${examId}`, { method: 'DELETE' });
        showToast('Đã xóa bài kiểm tra!', 'warning');
        loadCourseContent();
        document.getElementById('contentActiveState').style.display = 'none';
        document.getElementById('contentEmptyState').style.display = 'block';
    } catch(e) { showToast(e.message || 'Lỗi', 'error'); }
}


// ============================================================
// JOB TITLE CRUD
// ============================================================
async function loadJobTitles() {
    try {
        const titles = await apiFetch('/api/it/jobtitles');
        const tbody = document.getElementById('jobTitlesTable');
        if (!titles || titles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:40px">Chua co chuc danh nao</td></tr>';
            return;
        }
        tbody.innerHTML = titles.map(t => `
            <tr>
                <td>${t.jobTitleId || t.id}</td>
                <td><strong>${t.titleName || t.title}</strong></td>
                <td><span class="badge badge-info">Grade ${t.gradeLevel || 'N/A'}</span></td>
                <td><span style="font-weight:600;color:#3b82f6">${t.userCount || 0} người</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditJobTitleModal(${t.jobTitleId || t.id}, '${(t.titleName || t.title || '').replace(/'/g, "\\'")}', ${t.gradeLevel || 'null'})">Sửa</button>
                    <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626" onclick="deleteJobTitle(${t.jobTitleId || t.id}, '${(t.titleName || t.title || '').replace(/'/g, "\\'")}', ${t.userCount || 0})">Xóa</button>
                </td>
            </tr>`).join('');
    } catch(e) {
        document.getElementById('jobTitlesTable').innerHTML = '<tr><td colspan="5" style="color:#ef4444;padding:20px">Loi tai du lieu</td></tr>';
    }
}

function openCreateJobTitleModal() {
    document.getElementById('jobTitleModalId').value = '';
    document.getElementById('jobTitleModalName').value = '';
    document.getElementById('jobTitleModalGrade').value = '';
    document.getElementById('jobTitleModalTitle').textContent = 'Them Chuc Danh';
    openModal('jobTitleModal');
}

function openEditJobTitleModal(id, name, grade) {
    document.getElementById('jobTitleModalId').value = id;
    document.getElementById('jobTitleModalName').value = name;
    document.getElementById('jobTitleModalGrade').value = grade ?? '';
    document.getElementById('jobTitleModalTitle').textContent = 'Sua Chuc Danh';
    openModal('jobTitleModal');
}

async function submitJobTitle() {
    const id = document.getElementById('jobTitleModalId').value;
    const titleName = document.getElementById('jobTitleModalName').value.trim();
    const gradeRaw = document.getElementById('jobTitleModalGrade').value.trim();
    const gradeLevel = gradeRaw ? parseInt(gradeRaw) : null;

    if (!titleName) { showToast('Vui long nhap ten chuc danh!', 'error'); return; }

    try {
        const body = { titleName, gradeLevel };
        if (id) {
            await apiFetch('/api/it/jobtitles/' + id, { method: 'PUT', body: JSON.stringify(body) });
            showToast('Da cap nhat chuc danh!', 'success');
        } else {
            await apiFetch('/api/it/jobtitles', { method: 'POST', body: JSON.stringify(body) });
            showToast('Da them chuc danh moi!', 'success');
        }
        closeModal('jobTitleModal');
        loadJobTitles();
    } catch(e) { showToast(e.message || 'Loi', 'error'); }
}

async function deleteJobTitle(id, name, userCount) {
    if (userCount > 0) { showToast('Khong the xoa! Con ' + userCount + ' NV dang dung chuc danh nay.', 'error'); return; }
    if (!confirm('Xac nhan xoa chuc danh: ' + name + '?')) return;
    try {
        await apiFetch('/api/it/jobtitles/' + id, { method: 'DELETE' });
        showToast('Da xoa chuc danh!', 'warning');
        loadJobTitles();
    } catch(e) { showToast(e.message || 'Loi', 'error'); }
}

// ============================================================
// EXPORT EXCEL
// ============================================================
async function exportExcel(type) {
    const msgEl = document.getElementById('exportMsg');
    if (msgEl) { msgEl.style.display = 'block'; }

    let url = '/api/it/export/' + type;
    if (type === 'users') {
        const status = document.getElementById('exportUserStatus')?.value || '';
        if (status) url += '?status=' + encodeURIComponent(status);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Loi server: ' + response.status);
        }
        const blob = await response.blob();
        const contentDisp = response.headers.get('Content-Disposition') || '';
        let fileName = 'export.xlsx';
        const match = contentDisp.match(/filename[^;=\n]*=((['"])(.*?)\2|([^;\n]*))/);
        if (match) fileName = match[3] || match[4] || fileName;

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        showToast('Tai file thanh cong: ' + fileName, 'success');
    } catch(e) {
        showToast('Loi xuat file: ' + (e.message || e), 'error');
    } finally {
        if (msgEl) { setTimeout(() => { msgEl.style.display = 'none'; }, 3000); }
    }
}
document.addEventListener('DOMContentLoaded', init);
