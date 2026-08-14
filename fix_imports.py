import re

def fix_file(filepath, replacements, static_imports):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for r in replacements:
        content = content.replace(r, "")
    
    # insert static imports at the top
    # after the first import or at the very top
    lines = content.split('\n')
    insert_idx = 0
    for i, line in enumerate(lines):
        if line.startswith('import '):
            insert_idx = i + 1
    
    for imp in static_imports:
        if imp not in content:
            lines.insert(insert_idx, imp)
    
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))

fix_file('js/features/instructor/InstructorController.js', 
         ["const { InstructorService } = await import('./InstructorService.js');"], 
         ["import { InstructorService } from './InstructorService.js';"])

fix_file('js/features/instructor/InstructorUI.js',
         ["const { InstructorService } = await import('./InstructorService.js');",
          "const { MediaEngine } = await import('../../features/media/MediaEngine.js');"],
         ["import { InstructorService } from './InstructorService.js';",
          "import { MediaEngine } from '../../features/media/MediaEngine.js';"])

fix_file('js/features/chat/ChatController.js',
         ["const { ChatController } = await import('./ChatController.js');",
          "import('./ChatUI.js').then(({ ChatUI }) => {",
          "        import('./ChatUI.js').then(({ ChatUI }) => {",
          "            ChatUI.renderMessages(lessonId, this.cache.messages[lessonId]);",
          "        });"],
         ["import { ChatUI } from './ChatUI.js';"])
