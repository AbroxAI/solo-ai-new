// assets/js/profile-loader.js
(function() {
    // ===== Helper: get initials from name =====
    function getInitials(name) {
        if (!name) return 'DL';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DL';
    }

    // ===== Update all avatar elements =====
    function updateUserUI() {
        const savedName = localStorage.getItem('userName') || 'Damian Lee';
        const savedAvatar = localStorage.getItem('userAvatar');

        function applyAvatar(el) {
            if (!el) return;
            if (savedAvatar) {
                el.style.backgroundImage = `url("${savedAvatar}")`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.style.backgroundRepeat = 'no-repeat';
                el.textContent = '';
            } else {
                el.style.backgroundImage = 'none';
                el.textContent = getInitials(savedName);
            }
        }

        // 1. Update all elements with class "profile-avatar" (preferred)
        document.querySelectorAll('.profile-avatar').forEach(applyAvatar);

        // 2. Fallback: update known IDs (in case no class is present)
        const knownIds = ['sidebarAvatar', 'headerAvatar', 'topHeaderAvatar', 'profileAvatarLarge'];
        knownIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.classList.contains('profile-avatar')) {
                applyAvatar(el);
            }
        });

        // Update name fields
        const sidebarName = document.getElementById('sidebarName');
        const headerName = document.getElementById('headerName');
        if (sidebarName && savedName) sidebarName.textContent = savedName;
        if (headerName && savedName) headerName.textContent = savedName.split(' ')[0];
    }

    // ===== Compress image to max 256x256 =====
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

    // ===== Create hidden file input once =====
    function createFileInput() {
        if (document.getElementById('globalAvatarInput')) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'globalAvatarInput';
        input.accept = 'image/*';
        input.style.position = 'fixed';
        input.style.left = '-9999px';
        input.style.opacity = '0';
        document.body.appendChild(input);

        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            compressImage(file, function(dataURL) {
                try {
                    localStorage.setItem('userAvatar', dataURL);
                    updateUserUI();
                    showToast('📸 Avatar updated!');
                } catch (err) {
                    showToast('❌ Image too large. Please choose a smaller file.');
                }
            });
            this.value = '';
        });
    }

    // ===== Simple toast =====
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

    // ===== Attach click triggers to any .avatar-trigger =====
    function attachTriggers() {
        document.querySelectorAll('.avatar-trigger').forEach(el => {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const input = document.getElementById('globalAvatarInput');
                if (input) input.click();
            });
        });

        // Optional remove button
        const removeBtn = document.getElementById('removeAvatarBtn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                localStorage.removeItem('userAvatar');
                updateUserUI();
                showToast('🗑️ Avatar removed');
            });
        }
    }

    // ===== Initialization =====
    function init() {
        updateUserUI();
        createFileInput();
        attachTriggers();

        window.addEventListener('storage', function(e) {
            if (e.key === 'userAvatar' || e.key === 'userName') {
                updateUserUI();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
