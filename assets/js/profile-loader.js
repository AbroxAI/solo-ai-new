// assets/js/profile-loader.js
(function() {
    function updateUserUI() {
        const savedName = localStorage.getItem('userName');
        const savedAvatar = localStorage.getItem('userAvatar');

        function applyAvatar(el) {
            if (!el) return;
            if (savedAvatar) {
                el.style.backgroundImage = `url(${savedAvatar})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.textContent = '';
            } else if (savedName) {
                const initials = savedName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                el.style.backgroundImage = '';
                el.textContent = initials || 'DL';
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

        // Optional: any other avatar placeholders you use
        const topAvatar = document.getElementById('topHeaderAvatar');
        if (topAvatar) applyAvatar(topAvatar);
    }

    // Run on page load
    updateUserUI();

    // Listen for changes from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'userAvatar' || e.key === 'userName') {
            updateUserUI();
        }
    });
})();
