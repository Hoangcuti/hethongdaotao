import re

with open('c:/lms/thyachuong/thyachuong/KhoaHoc/Views/IT/Index.cshtml', 'r', encoding='utf-8') as f:
    text = f.read()

replacement = '''} catch(e) {
    if(typeof console !== 'undefined') console.error(e);
    if(typeof showToast === 'function') showToast(e.message || 'Lỗi API Backend: Mã lỗi 500', 'error');
    if(typeof document !== 'undefined') {
        document.querySelectorAll('.loading-overlay').forEach(el => {
            if(el.parentElement && el.parentElement.tagName === 'TD') {
                el.parentElement.innerHTML = '<div style="text-align:center;color:#ef4444;padding:20px;">Lỗi tải dữ liệu. Cần Update Database hoặc Code</div>';
            }
        });
    }
}'''

text = re.sub(r'\}\s*catch\s*\([^)]*\)\s*\{\s*\}', replacement, text)

with open('c:/lms/thyachuong/thyachuong/KhoaHoc/Views/IT/Index.cshtml', 'w', encoding='utf-8') as f:
    f.write(text)
