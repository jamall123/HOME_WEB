const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf-8');
if (!css.includes('main {\n    padding-top: 90px;\n}')) {
  fs.appendFileSync('css/style.css', '\nmain {\n    padding-top: 90px;\n}\n');
}
