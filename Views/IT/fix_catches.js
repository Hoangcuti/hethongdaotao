const fs = require('fs');
let code = fs.readFileSync('c:/lms/thyachuong/thyachuong/KhoaHoc/Views/IT/Index.cshtml', 'utf8');

const regex = /\} catch(\s*)\(e\)(\s*)\{\s*\}/g;
code = code.replace(regex, } catch1(e)2{ 
    console.error(e); 
    if(typeof showToast === 'function') showToast(e.message || 'Có lỗi xảy ra', 'error'); 
    document.querySelectorAll('.loading-overlay').forEach(el => {
        if(el.parentElement && el.parentElement.tagName === 'TD') {
            el.parentElement.innerHTML = '<div style=\'text-align:center;color:#ef4444;padding:20px;\'>Lỗi tải dữ liệu</div>';
        }
    });
});

fs.writeFileSync('c:/lms/thyachuong/thyachuong/KhoaHoc/Views/IT/Index.cshtml', code);
console.log('Fixed empty catches');
