"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var admin = require("firebase-admin");
var bcrypt = require("bcryptjs");
admin.initializeApp();
var db = admin.firestore();
function hashPasswords() {
    return __awaiter(this, void 0, void 0, function () {
        var credentialsRef, snapshot, hashedCount, skippedCount, _i, _a, doc, data, password, salt, hashedPassword;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Starting password migration...');
                    credentialsRef = db.collection('courses_credentials');
                    return [4 /*yield*/, credentialsRef.get()];
                case 1:
                    snapshot = _b.sent();
                    hashedCount = 0;
                    skippedCount = 0;
                    _i = 0, _a = snapshot.docs;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    doc = _a[_i];
                    data = doc.data();
                    password = data.password;
                    if (!password || typeof password !== 'string') {
                        console.log("Skipping ".concat(doc.id, ": no valid password field."));
                        skippedCount++;
                        return [3 /*break*/, 6];
                    }
                    // Check if it's already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
                    if (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$')) {
                        console.log("Skipping ".concat(doc.id, ": password already hashed."));
                        skippedCount++;
                        return [3 /*break*/, 6];
                    }
                    return [4 /*yield*/, bcrypt.genSalt(10)];
                case 3:
                    salt = _b.sent();
                    return [4 /*yield*/, bcrypt.hash(password, salt)];
                case 4:
                    hashedPassword = _b.sent();
                    // Update the document
                    return [4 /*yield*/, doc.ref.update({
                            password: hashedPassword,
                            password_migrated: true,
                            migratedAt: new Date().toISOString()
                        })];
                case 5:
                    // Update the document
                    _b.sent();
                    console.log("Successfully hashed password for ".concat(doc.id));
                    hashedCount++;
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    console.log("\nMigration completed.");
                    console.log("Hashed: ".concat(hashedCount, " accounts"));
                    console.log("Skipped: ".concat(skippedCount, " accounts"));
                    return [2 /*return*/];
            }
        });
    });
}
hashPasswords().then(function () {
    process.exit(0);
}).catch(function (err) {
    console.error('Migration failed:', err);
    process.exit(1);
});
