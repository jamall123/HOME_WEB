/**
 * submit-story.js — نموذج تقديم قصة من الزوار
 */

(function () {
  'use strict';

  const form = document.getElementById('storyForm');
  const submitBtn = document.getElementById('submitBtn');
  const formMessage = document.getElementById('formMessage');
  const fileInput = document.getElementById('fileInput');
  const fileUploadArea = document.getElementById('fileUploadArea');
  const filePreview = document.getElementById('filePreview');
  const storyTextarea = document.getElementById('story');
  const charCount = document.getElementById('charCount');

  let uploadedFiles = [];

  // عداد الأحرف
  storyTextarea.addEventListener('input', () => {
    charCount.textContent = storyTextarea.value.length;
  });

  // رفع الملفات
  fileUploadArea.addEventListener('click', () => fileInput.click());
  fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('drag-over');
  });
  fileUploadArea.addEventListener('dragleave', () => fileUploadArea.classList.remove('drag-over'));
  fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

  function handleFiles(files) {
    const newFiles = Array.from(files).slice(0, 3 - uploadedFiles.length);
    newFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showMessage('الصورة ' + file.name + ' أكبر من 5MB', 'error');
        return;
      }
      uploadedFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
          <img src="${e.target.result}" alt="preview">
          <button type="button" class="preview-remove" data-name="${file.name}">
            <i class="fas fa-times"></i>
          </button>
        `;
        filePreview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  }

  filePreview.addEventListener('click', (e) => {
    const btn = e.target.closest('.preview-remove');
    if (!btn) return;
    const name = btn.dataset.name;
    uploadedFiles = uploadedFiles.filter(f => f.name !== name);
    btn.closest('.preview-item').remove();
  });

  // تقديم النموذج
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    formMessage.textContent = '';
    formMessage.className = 'form-message';

    try {
      // رفع الصور أولاً
      const attachmentUrls = [];
      for (const file of uploadedFiles) {
        const fileName = `submissions/${Date.now()}_${file.name}`;
        const ref = firebase.storage().ref().child(fileName);
        await ref.put(file);
        const url = await ref.getDownloadURL();
        attachmentUrls.push(url);
      }

      const data = {
        submitterName: document.getElementById('submitterName').value.trim(),
        submitterEmail: document.getElementById('submitterEmail').value.trim(),
        submitterPhone: document.getElementById('submitterPhone').value.trim(),
        profileLink: document.getElementById('profileLink').value.trim(),
        title: document.getElementById('title').value.trim(),
        story: document.getElementById('story').value.trim(),
        category: document.getElementById('category').value,
        attachments: attachmentUrls
      };

      await JHomeAPI.submitStory(data);
      if (window.JHomeAPI) JHomeAPI.trackEvent('story_submit', { category: data.category });

      showMessage('✅ تم استلام قصتك بنجاح! سنراجعها ونرد عليك خلال 48 ساعة.', 'success');
      form.reset();
      uploadedFiles = [];
      filePreview.innerHTML = '';
      charCount.textContent = '0';
    } catch (err) {
      console.error(err);
      showMessage(err.message || 'حدث خطأ، حاول مرة أخرى', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال القصة';
    }
  });

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = 'form-message ' + type;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
})();