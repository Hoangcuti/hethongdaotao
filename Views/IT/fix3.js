
const fs = require('fs');
let code = fs.readFileSync('c:/lms/thyachuong/thyachuong/KhoaHoc/Views/IT/Index.cshtml', 'utf8');
code = code.replace(/const _origNavigate = navigate;\r?\nfunction navigate\(page\) \{[\s\S]*?\n\s*\}\s*else \{\r?\n\s*_origNavigate\(page\);\r?\n\s*\}\r?\n\}/g, '');
code = code.replace(/const extPageTitles = \{[\s\S]*?\};\r?\n/g, '');
code = code.replace(/\/\/ Cập nhật pageTitles \+ navigate\(\) để nhận 6 trang mới\r?\n/g, '');
fs.writeFileSync('c:/lms/thyachuong/thyachuong/KhoaHoc/Views/IT/Index.cshtml', code);
console.log('Patch removed!');

