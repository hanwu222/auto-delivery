// ==========================================
// 后台管理功能 - API版本
// ==========================================

// 检查登录状态
function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        showAdminPanel();
    }
}

// 管理员登录
function adminLogin() {
    const password = document.getElementById('adminPassword').value;

    if (password === CONFIG.ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        showToast('登录成功');
    } else {
        showToast('密码错误', 'error');
    }
}

// 管理员登出
function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
}

// 显示管理面板
function showAdminPanel() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'block';
    refreshData();
}

// 刷新数据
async function refreshData() {
    await updateStats();
}

// 更新统计数据
async function updateStats() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/stats`);
        const data = await response.json();

        if (data.success) {
            const stats = data.stats;
            document.getElementById('statPending').textContent = stats.pending;
            document.getElementById('statDelivered').textContent = stats.delivered;
            document.getElementById('statStock').textContent = stats.stock;
            document.getElementById('statRevenue').textContent = `¥${stats.revenue}`;
        }
    } catch (error) {
        console.error('获取统计失败:', error);
    }
}

// 显示上传模态框
function showUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
}

// 关闭上传模态框
function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    document.getElementById('uploadContent').value = '';
}

// 上传文件
async function uploadFiles() {
    const content = document.getElementById('uploadContent').value.trim();
    const password = sessionStorage.getItem('adminPassword') || CONFIG.ADMIN_PASSWORD;

    if (!content) {
        showToast('请输入文件内容', 'error');
        return;
    }

    // 按行分割
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
        showToast('请输入有效内容', 'error');
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/upload-files`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
                contents: lines
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || '上传失败');
        }

        showToast(data.message);
        closeUploadModal();
        refreshData();
    } catch (error) {
        console.error('上传失败:', error);
        showToast(error.message || '上传失败，请重试', 'error');
    }
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', checkAdminLogin);

// 回车提交登录
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                adminLogin();
            }
        });
    }
});
