const fs = require('fs');
const file = 'js/features/instructor/InstructorController.js';
let content = fs.readFileSync(file, 'utf8');

// Add static imports
const importsToAdd = `import { MediaEngine } from '../../features/media/MediaEngine.js';
import { NotificationManager } from '../../features/global/NotificationManager.js';
`;
content = importsToAdd + content;

// Remove dynamic imports
content = content.replace(/const\s+\{\s*MediaEngine\s*\}\s*=\s*await\s+import\([^)]+\);/g, '');
content = content.replace(/const\s+\{\s*NotificationManager\s*\}\s*=\s*await\s+import\([^)]+\);/g, '');

fs.writeFileSync(file, content);
console.log('Fixed InstructorController.js');
