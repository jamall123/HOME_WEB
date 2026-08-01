import * as admin from 'firebase-admin';
import * as bcrypt from 'bcryptjs';

admin.initializeApp();

const db = admin.firestore();

async function hashPasswords() {
    console.log('Starting password migration...');
    const credentialsRef = db.collection('courses_credentials');
    const snapshot = await credentialsRef.get();
    
    let hashedCount = 0;
    let skippedCount = 0;
    
    for (const doc of snapshot.docs) {
        const data = doc.data();
        const password = data.password;
        
        if (!password || typeof password !== 'string') {
            console.log(`Skipping ${doc.id}: no valid password field.`);
            skippedCount++;
            continue;
        }
        
        // Check if it's already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
        if (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$')) {
            console.log(`Skipping ${doc.id}: password already hashed.`);
            skippedCount++;
            continue;
        }
        
        // Hash the plaintext password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update the document
        await doc.ref.update({
            password: hashedPassword,
            password_migrated: true,
            migratedAt: new Date().toISOString()
        });
        
        console.log(`Successfully hashed password for ${doc.id}`);
        hashedCount++;
    }
    
    console.log(`\nMigration completed.`);
    console.log(`Hashed: ${hashedCount} accounts`);
    console.log(`Skipped: ${skippedCount} accounts`);
}

hashPasswords().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
