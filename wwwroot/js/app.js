// ============================================================
// LMS Shared Utilities
// ============================================================

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function showToast(msg, type = 'success', opts = {}) {
    const container = document.getElementById('toastContainer') || (() => {
        const c = document.createElement('div');
        c.id = 'toastContainer';
        c.className = 'toast-container';
        document.body.appendChild(c);
        return c;
    })();

    // Avoid duplicate toast messages
    if (container) {
        const existingToasts = container.querySelectorAll('.toast');
        for (const t of existingToasts) {
            const msgEl = t.querySelector('.toast-message');
            if (msgEl && msgEl.textContent === msg) {
                return t;
            }
        }
    }

    const icons = { success: '✓', error: '✕', warning: '!', info: 'i' };
    const titles = {
        success: 'Thành công',
        error: 'Lỗi hệ thống',
        warning: 'Lưu ý',
        info: 'Thông báo'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type} ${opts.persistent ? 'persistent' : ''}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'i'}</span>
        <div class="toast-content">
            <div class="toast-title">${escapeHtml(opts.title || titles[type] || 'Thông báo')}</div>
            <div class="toast-message">${escapeHtml(msg)}</div>
        </div>
        <button type="button" class="toast-close" aria-label="Đóng">×</button>`;

    container.appendChild(toast);
    toast.querySelector('.toast-close')?.addEventListener('click', () => toast.remove());

    if (!opts.persistent) {
        setTimeout(() => toast.remove(), opts.duration || 4200);
    }

    return toast;
}

function fmtDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateTime(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtCurrency(num) {
    if (num === null || num === undefined) return '0 VND';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

function fmtNumber(num) {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
}

function debounce(fn, wait = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

async function apiFetch(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const headers = { ...(options.headers || {}) };
        const isFormData = options.body instanceof FormData || options.isFormData;
        if (!isFormData && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(url, {
            headers,
            signal: controller.signal,
            ...options
        });
        clearTimeout(timer);

        const isJson = res.headers.get('content-type')?.includes('application/json');
        const redirectedToLogin = res.redirected && res.url && /\/Auth\/Login/i.test(res.url);

        if (redirectedToLogin) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        if (!res.ok) {
            let errorMsg = `Lỗi hệ thống (${res.status})`;
            let errTitle = null;
            if (isJson) {
                const errData = await res.json();
                errorMsg = errData.error || errData.title || errorMsg;
                errTitle = errData.title || null;
            } else {
                const text = await res.text();
                if (text && text.length < 300) errorMsg = text;
            }
            const error = new Error(errorMsg);
            if (errTitle) error.title = errTitle;
            throw error;
        }

        if (isJson) {
            const data = await res.json();
            // Chỉ throw khi có error và không có data khác, tránh phá vỡ flow
            if (data && typeof data === 'object' && data.error && Object.keys(data).length === 1) {
                throw new Error(data.error);
            }
            return data;
        }

        const text = await res.text();
        if (typeof text === 'string' && /<form[^>]*action=\"\/Auth\/Login|<title>\s*Login/i.test(text)) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        return text;
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            const timeoutErr = new Error('Request timeout - Server phản hồi quá chậm');
            showToast(timeoutErr.message, 'error');
            throw timeoutErr;
        }
        console.error('API Error:', url, err.message);
        showToast(err.message || 'Lỗi kết nối máy chủ', 'error', { title: err.title });
        throw err;
    }
}

function statusBadge(status) {
    const map = {
        Active: '<span class="badge badge-success">Hoạt động</span>',
        Inactive: '<span class="badge badge-danger">Vô hiệu</span>',
        Completed: '<span class="badge badge-success">Hoàn thành</span>',
        InProgress: '<span class="badge badge-blue">Đang học</span>',
        NotStarted: '<span class="badge badge-gray">Chưa bắt đầu</span>',
        Published: '<span class="badge badge-success">Đã phát hành</span>',
        Draft: '<span class="badge badge-warning">Nháp</span>',
        High: '<span class="badge badge-danger">Cao</span>',
        Normal: '<span class="badge badge-blue">Bình thường</span>',
        Low: '<span class="badge badge-gray">Thấp</span>'
    };
    return map[status] || `<span class="badge badge-gray">${escapeHtml(status || 'N/A')}</span>`;
}

function progressBar(pct, color = '') {
    const c = pct >= 100 ? 'green' : pct >= 50 ? '' : 'orange';
    return `
    <div class="progress-wrap">
      <div class="progress-bar-track">
        <div class="progress-bar-fill ${color || c}" style="width:${Math.min(pct, 100)}%"></div>
      </div>
      <span class="progress-text">${pct}%</span>
    </div>`;
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function setActivePage(id) {
    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
    const el = document.querySelector(`[data-page="${id}"]`);
    if (el) el.classList.add('active');
    const altEl = document.querySelector(`[data-nav-page="${id}"]`);
    if (altEl) altEl.classList.add('active');

    document.querySelectorAll('.page-section').forEach(s => {
        s.style.display = s.id === id ? '' : 'none';
    });

    // Tự động cuộn lên đầu trang khi chuyển mục
    const scrollContainer = document.querySelector('.main-content') || document.querySelector('.student-main');
    if (scrollContainer) {
        scrollContainer.scrollTop = 0;
    }
}

function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    if (typeof clearAllInlineErrors === 'function') {
        clearAllInlineErrors(id);
    }
    const openCount = document.querySelectorAll('.modal-backdrop.open').length;
    m.style.zIndex = String(1000 + (openCount + 1) * 20);
    m.classList.add('open');
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('open');
}

document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('open');
    }
});

function initializeTheme() {
    const savedTheme = localStorage.getItem('lms_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function updateThemeButton(theme) {
    document.querySelectorAll('#themeToggleBtn').forEach(btn => {
        btn.innerHTML = theme === 'dark'
            ? '<span class="nav-icon">☾</span><span class="nav-text">Dark mode</span>'
            : '<span class="nav-icon">☀</span><span class="nav-text">Light mode</span>';
    });
}

function toggleTheme() {
    const htmlEl = document.documentElement;
    const currentTheme = htmlEl.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', nextTheme);
    localStorage.setItem('lms_theme', nextTheme);
    updateThemeButton(nextTheme);
    document.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: nextTheme } }));
}

function setSidebarOpen(isOpen) {
    document.body.classList.toggle('sidebar-open', !!isOpen);
    document.getElementById('sidebarBackdrop')?.classList.toggle('is-open', !!isOpen);
}

function initializeShell() {
    updateThemeButton(document.documentElement.getAttribute('data-theme') || 'light');

    document.querySelectorAll('[data-page]').forEach(link => {
        if (link.getAttribute('href') === '#') {
            link.addEventListener('click', event => {
                event.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    setActivePage(page);
                    setSidebarOpen(false);
                }
            });
        }
    });

    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                setSidebarOpen(false);
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            setSidebarOpen(false);
        }
    });
}

function showConfirmModal(message, options = {}) {
    return new Promise((resolve) => {
        const id = 'dynamicConfirmModal';
        let modal = document.getElementById(id);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = id;
            modal.className = 'modal-backdrop';
            document.body.appendChild(modal);
        }

        const title = options.title || 'Xác nhận';
        const confirmText = options.confirmText || 'Xác nhận';
        const cancelText = options.cancelText || 'Hủy';
        const isDanger = options.isDanger !== false;

        modal.innerHTML = `
            <div class="modal-box" style="max-width: 440px; padding: 24px; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--border-color); box-shadow: var(--shadow-lg);">
                <div class="modal-header" style="border-bottom: none; padding: 0 0 12px 0; display: flex; align-items: center; justify-content: space-between;">
                    <div class="modal-title" style="font-size: 1.2rem; font-weight: 600; color: var(--color-text);">${escapeHtml(title)}</div>
                    <button class="modal-close" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid var(--border-color); background: var(--color-surface); color: var(--color-text-secondary); cursor: pointer;" id="confirmModalCloseBtn">✕</button>
                </div>
                <div class="modal-body" style="padding: 0 0 20px 0; color: var(--color-text-secondary); font-size: 0.95rem; line-height: 1.5;">
                    ${escapeHtml(message).replace(/\n/g, '<br>')}
                </div>
                <div class="modal-footer" style="border-top: none; padding: 0; display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn btn-secondary" style="padding: 8px 16px; border-radius: var(--radius-xs); border: 1px solid var(--border-color); background: var(--color-surface); color: var(--color-text); font-weight: 500; cursor: pointer;" id="confirmModalCancelBtn">${escapeHtml(cancelText)}</button>
                    <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" style="padding: 8px 16px; border-radius: var(--radius-xs); border: none; background: ${isDanger ? 'var(--color-danger)' : 'var(--color-primary)'}; color: white; font-weight: 500; cursor: pointer;" id="confirmModalConfirmBtn">${escapeHtml(confirmText)}</button>
                </div>
            </div>
        `;

        const onConfirm = () => {
            closeModal(id);
            resolve(true);
        };

        const onCancel = () => {
            closeModal(id);
            resolve(false);
        };

        document.getElementById('confirmModalConfirmBtn').addEventListener('click', onConfirm);
        document.getElementById('confirmModalCancelBtn').addEventListener('click', onCancel);
        document.getElementById('confirmModalCloseBtn').addEventListener('click', onCancel);

        // Click on backdrop to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                onCancel();
            }
        };

        openModal(id);
    });
}

function handleCourseDateChange() {
    const startDateEl = document.getElementById('courseModalStartDate');
    const endDateEl = document.getElementById('courseModalEndDate');
    const errorEl = document.getElementById('courseModalEndDateError');
    if (startDateEl && endDateEl) {
        endDateEl.min = startDateEl.value;
        if (errorEl) {
            if (startDateEl.value && endDateEl.value && endDateEl.value <= startDateEl.value) {
                errorEl.textContent = 'Ngày kết thúc phải sau ngày bắt đầu.';
                errorEl.style.display = 'block';
            } else {
                errorEl.style.display = 'none';
            }
        }
    }
}
document.addEventListener('change', (e) => {
    if (e.target && (e.target.id === 'courseModalStartDate' || e.target.id === 'courseModalEndDate')) {
        handleCourseDateChange();
    }
});
document.addEventListener('input', (e) => {
    if (e.target && (e.target.id === 'courseModalStartDate' || e.target.id === 'courseModalEndDate')) {
        handleCourseDateChange();
    }
});

// Inline error helper functions
function setInlineError(inputEl, msg) {
    if (!inputEl) return;
    inputEl.style.borderColor = '#ef4444';
    let errorEl = inputEl.parentNode.querySelector('.inline-error-message');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'inline-error-message';
        errorEl.style.color = '#ef4444';
        errorEl.style.fontSize = '12px';
        errorEl.style.marginTop = '4px';
        errorEl.style.fontWeight = '500';
        inputEl.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
}

function clearInlineError(inputEl) {
    if (!inputEl) return;
    inputEl.style.borderColor = '';
    const errorEl = inputEl.parentNode.querySelector('.inline-error-message');
    if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
    }
}

function clearAllInlineErrors(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const inputs = container.querySelectorAll('.form-input');
    inputs.forEach(inputEl => {
        clearInlineError(inputEl);
    });
}

// Dynamically set minimum date for endDate based on startDate
document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'libraryExamStartDateInput') {
        const endDateEl = document.getElementById('libraryExamEndDateInput');
        if (endDateEl) {
            endDateEl.min = e.target.value;
        }
    }
});
document.addEventListener('input', (e) => {
    if (e.target && e.target.classList.contains('form-input')) {
        clearInlineError(e.target);
    }
});
document.addEventListener('change', (e) => {
    if (e.target && e.target.classList.contains('form-input')) {
        clearInlineError(e.target);
    }
});

// Prevent negative sign, positive sign, exponent e/E, and decimals if it's an integer input
document.addEventListener('keydown', (e) => {
    const target = e.target;
    if (!target) return;
    
    const id = target.id || '';
    const isMaxAttempts = id.includes('MaxAttemptsInput');
    const isDuration = id.includes('DurationInput');
    const isPassScore = id.includes('PassScoreInput');
    
    if (isMaxAttempts || isDuration || isPassScore) {
        // Block '-', '+', 'e', 'E'
        if (['-', '+', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
            return;
        }
        
        // Also block '.' and ',' for integer inputs (MaxAttempts and Duration)
        if ((isMaxAttempts || isDuration) && (e.key === '.' || e.key === ',')) {
            e.preventDefault();
            return;
        }
    }
});

// Prevent pasting invalid non-positive characters
document.addEventListener('paste', (e) => {
    const target = e.target;
    if (!target) return;
    
    const id = target.id || '';
    const isMaxAttempts = id.includes('MaxAttemptsInput');
    const isDuration = id.includes('DurationInput');
    const isPassScore = id.includes('PassScoreInput');
    
    if (isMaxAttempts || isDuration || isPassScore) {
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('text');
        
        let regex;
        if (isMaxAttempts || isDuration) {
            // Only allow positive integers (digits only)
            regex = /^[0-9]+$/;
        } else {
            // Allow positive decimals (digits and at most one decimal point/comma)
            regex = /^[0-9]+([.,][0-9]+)?$/;
        }
        
        if (!regex.test(pastedData)) {
            e.preventDefault();
        }
    }
});

// Initialize Multiple Select to Checkbox UI conversion
document.addEventListener('DOMContentLoaded', () => {
    const selectEl = document.getElementById('courseModalTargetDept');
    if (selectEl) {
        const container = document.createElement('div');
        container.id = 'courseModalTargetDeptContainer';
        container.style.border = '1px solid var(--border-color)';
        container.style.borderRadius = '6px';
        container.style.padding = '10px';
        container.style.maxHeight = '150px';
        container.style.overflowY = 'auto';
        container.style.background = 'var(--color-surface)';
        container.style.marginTop = '4px';
        
        selectEl.parentNode.insertBefore(container, selectEl);
        selectEl.style.display = 'none'; // Hide the original select
        
        const label = selectEl.parentNode.querySelector('label');
        if (label && label.textContent.includes('Giữ Ctrl để chọn nhiều')) {
            label.textContent = label.textContent.replace(' (Giữ Ctrl để chọn nhiều)', '');
        }

        function renderCheckboxes() {
            container.innerHTML = '';
            Array.from(selectEl.options).forEach(opt => {
                if (!opt.value) return; // Skip empty option
                
                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.alignItems = 'center';
                div.style.gap = '8px';
                div.style.marginBottom = '6px';
                
                const chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.value = opt.value;
                chk.checked = opt.selected;
                chk.style.width = '16px';
                chk.style.height = '16px';
                chk.style.cursor = 'pointer';
                
                const lbl = document.createElement('label');
                lbl.textContent = opt.textContent;
                lbl.style.margin = '0';
                lbl.style.cursor = 'pointer';
                lbl.style.fontSize = '14px';
                lbl.style.fontWeight = 'normal';
                
                chk.addEventListener('change', () => {
                    opt.selected = chk.checked;
                    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                });
                
                lbl.addEventListener('click', () => {
                    chk.checked = !chk.checked;
                    chk.dispatchEvent(new Event('change'));
                });
                
                div.appendChild(chk);
                div.appendChild(lbl);
                container.appendChild(div);
            });
        }

        renderCheckboxes();

        const observer = new MutationObserver(() => {
            renderCheckboxes();
        });
        observer.observe(selectEl, { childList: true, subtree: true });

        const syncCheckboxes = () => {
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(chk => {
                const opt = Array.from(selectEl.options).find(o => o.value === chk.value);
                if (opt) chk.checked = opt.selected;
            });
        };

        selectEl.addEventListener('sync', syncCheckboxes);
        selectEl.addEventListener('change', syncCheckboxes);
    }
});


