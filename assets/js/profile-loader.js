// assets/js/profile-loader.js
(function() {
    // ===== Helper: get initials from name =====
    function getInitials(name) {
        if (!name) return 'DL';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DL';
    }

    // ===== Update all avatar elements on the page =====
    function updateUserUI() {
        const savedName = localStorage.getItem('userName') || 'Damian Lee';
        const savedAvatar = localStorage.getItem('userAvatar');

        // Apply avatar image or initials to a given element
        function applyAvatar(el) {
            if (!el) return;
            if (savedAvatar) {
                el.style.backgroundImage = `url(${savedAvatar})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.textContent = '';
            } else {
                const initials = getInitials(savedName);
                el.style.backgroundImage = '';
                el.textContent = initials;
            }
        }

        // Sidebar
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarName = document.getElementById('sidebarName');
        if (sidebarAvatar) applyAvatar(sidebarAvatar);
        if (sidebarName && savedName) sidebarName.textContent = savedName;

        // Top header
        const headerAvatar = document.getElementById('headerAvatar');
        const headerName = document.getElementById('headerName');
        if (headerAvatar) applyAvatar(headerAvatar);
        if (headerName && savedName) headerName.textContent = savedName.split(' ')[0];

        // Optional: other avatar placeholders
        const topAvatar = document.getElementById('topHeaderAvatar');
        if (topAvatar) applyAvatar(topAvatar);

        // Profile large avatar (settings page)
        const profileAvatarLarge = document.getElementById('profileAvatarLarge');
        if (profileAvatarLarge) applyAvatar(profileAvatarLarge);
    }

    // ===== Compression function (resize to max 256x256) =====
    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const maxDim = 256;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxDim) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataURL = canvas.toDataURL('image/jpeg', 0.85);
                callback(dataURL);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ===== Global Avatar Upload Modal =====
    function createAvatarModal() {
        if (document.getElementById('avatarModalOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'avatarModalOverlay';
        overlay.className = 'avatar-modal-overlay';
        overlay.style.cssText = `
            position: fixed; top:0; left:0; right:0; bottom:0;
            background: rgba(15,23,42,0.6); backdrop-filter: blur(4px);
            z-index:1000; display:none; align-items:center; justify-content:center;
        `;

        const modal = document.createElement('div');
        modal.className = 'avatar-modal';
        modal.style.cssText = `
            background: #fff; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            max-width: 360px; width: 90%; padding: 20px; text-align: center;
        `;
        // Dark mode support
        if (document.body.classList.contains('dark')) {
            modal.style.background = '#1E293B';
            modal.style.color = '#F1F5F9';
        }

        modal.innerHTML = `
            <h3 style="margin-top:0; font-size:1.1rem; font-weight:700;">Change Profile Picture</h3>
            <div id="avatarModalPreview" style="width:100px;height:100px;border-radius:50%;margin:10px auto;background-size:cover;background-position:center;background-color:#EFF6FF;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:600;color:#2563EB;">
                ${getInitials(localStorage.getItem('userName') || 'DL')}
            </div>
            <button id="avatarModalUploadBtn" style="background:#2563EB;color:white;border:none;border-radius:8px;padding:8px 16px;font-size:0.85rem;cursor:pointer;">Upload Image</button>
            <button id="avatarModalRemoveBtn" style="background:transparent;color:#EF4444;border:1px solid #EF4444;border-radius:8px;padding:8px 16px;font-size:0.85rem;cursor:pointer;margin-left:8px;">Remove</button>
            <br><br>
            <button id="avatarModalCloseBtn" style="background:transparent;color:#64748B;border:1px solid #E5E7EB;border-radius:8px;padding:8px 16px;font-size:0.85rem;cursor:pointer;">Close</button>
            <input type="file" id="avatarModalFileInput" accept="image/*" style="display:none;">
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Event listeners
        const overlayEl = document.getElementById('avatarModalOverlay');
        const previewEl = document.getElementById('avatarModalPreview');
        const uploadBtn = document.getElementById('avatarModalUploadBtn');
        const removeBtn = document.getElementById('avatarModalRemoveBtn');
        const closeBtn = document.getElementById('avatarModalCloseBtn');
        const fileInput = document.getElementById('avatarModalFileInput');

        function openModal() {
            overlayEl.style.display = 'flex';
            // Update preview with current avatar or initials
            const savedAvatar = localStorage.getItem('userAvatar');
            if (savedAvatar) {
                previewEl.style.backgroundImage = `url(${savedAvatar})`;
                previewEl.textContent = '';
            } else {
                previewEl.style.backgroundImage = '';
                previewEl.textContent = getInitials(localStorage.getItem('userName') || 'DL');
            }
        }

        function closeModal() {
            overlayEl.style.display = 'none';
        }

        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            compressImage(file, function(dataURL) {
                try {
                    localStorage.setItem('userAvatar', dataURL);
                    updateUserUI();
                    // Update modal preview
                    previewEl.style.backgroundImage = `url(${dataURL})`;
                    previewEl.textContent = '';
                    // Show toast (optional)
                    showToast('📸 Avatar updated!');
                } catch (err) {
                    showToast('❌ Image too large. Please choose a smaller file.');
                }
            });
            this.value = '';
        });

        removeBtn.addEventListener('click', function() {
            localStorage.removeItem('userAvatar');
            updateUserUI();
            previewEl.style.backgroundImage = '';
            previewEl.textContent = getInitials(localStorage.getItem('userName') || 'DL');
            showToast('🗑️ Avatar removed');
        });

        closeBtn.addEventListener('click', closeModal);
        overlayEl.addEventListener('click', function(e) {
            if (e.target === overlayEl) closeModal();
        });

        // Simple toast function
        function showToast(message) {
            const existing = document.querySelector('.toast-notification');
            if (existing) existing.remove();
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.style.cssText = `
                position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
                background: #1E293B; color: #F1F5F9; padding: 0.5rem 1rem;
                border-radius: 8px; font-size: 0.8rem; z-index: 2000;
                display: flex; align-items: center; gap: 0.5rem;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }

        // Expose openModal globally so other scripts can call it if needed
        window.openAvatarModal = openModal;
    }

    // ===== Attach click events to avatar-trigger elements =====
    function attachAvatarTriggers() {
        document.querySelectorAll('.avatar-trigger').forEach(el => {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (window.openAvatarModal) {
                    window.openAvatarModal();
                }
            });
        });
    }

    // ===== Initialization =====
    function init() {
        updateUserUI();
        createAvatarModal();
        attachAvatarTriggers();

        // Listen for storage changes from other tabs
        window.addEventListener('storage', function(e) {
            if (e.key === 'userAvatar' || e.key === 'userName') {
                updateUserUI();
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
