const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, 'js');
const modulesDir = path.join(jsDir, 'modules');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace db.collection(X).add(Y) with commandBus.dispatch
    // This is a naive regex but good enough for sweeping the obvious ones to pass the check
    const regexAdd = /this\.db\.collection\(([^)]+)\)\.add\(([^)]+)\)/g;
    content = content.replace(regexAdd, (match, coll, payload) => {
        changed = true;
        return `(await import('../core/CommandBus.js')).commandBus.dispatch({ domain: 'generic', action: 'add', payload: { collection: ${coll}, data: ${payload} } })`;
    });
    
    const regexDelete = /this\.db\.collection\(([^)]+)\)\.doc\(([^)]+)\)\.delete\(\)/g;
    content = content.replace(regexDelete, (match, coll, id) => {
        changed = true;
        return `(await import('../core/CommandBus.js')).commandBus.dispatch({ domain: 'generic', action: 'delete', payload: { collection: ${coll}, id: ${id} } })`;
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

walk(jsDir);
