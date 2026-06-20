// utils/slugify.js
// تحويل العنوان العربي إلى slug للرابط
module.exports.slugify = function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    // إزالة التشكيل
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    // استبدال الحروف العربية بمكافئاتها اللاتينية للـ URL
    .replace(/[أإآا]/g, "a")
    .replace(/[ىي]/g, "y")
    .replace(/ؤ/g, "w")
    .replace(/ئ/g, "e")
    .replace(/ة/g, "h")
    .replace(/[ء]/g, "")
    // باقي الحروف
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};