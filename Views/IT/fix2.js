const fs = require('fs');
let content = fs.readFileSync('c:/lms/thyachuong/thyachuong/KhoaHoc/Views/IT/Index.cshtml', 'utf8');
content = content.replace(/const _origNavigate = navigate;[\\s\\S]*?_origNavigate\\(page\\);?
    }?
}/, '/* monkey-patch removed */');
fs.writeFileSync('c:/lms/thyachuong/thyachuong/KhoaHoc/Views/IT/Index.cshtml', content);
