// ==========================================
// 核心应用逻辑 - API版本
// ==========================================

// ==========================================
// 工具函数
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==========================================
// 前台功能：创建订单并显示支付二维码
// ==========================================

async function createOrder() {
    const contact = document.getElementById('contact')?.value.trim();

    if (!contact) {
        showToast('请填写联系方式', 'error');
        return;
    }

    const buyBtn = document.getElementById('buyBtn');
    if (buyBtn) {
        buyBtn.disabled = true;
        buyBtn.innerHTML = '<span class="loading"></span> 生成中...';
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || '创建订单失败');
        }

        // 显示支付二维码
        showPaymentQRCode(data);
        showToast('订单创建成功');

    } catch (error) {
        console.error('创建订单失败:', error);
        showToast(error.message || '创建订单失败，请重试', 'error');
    } finally {
        if (buyBtn) {
            buyBtn.disabled = false;
            buyBtn.innerHTML = '立即购买';
        }
    }
}

// 显示支付二维码弹窗
function showPaymentQRCode(orderData) {
    const modal = document.getElementById('paymentModal');
    const qrImage = document.getElementById('qrImage');
    const displayOrderNo = document.getElementById('displayOrderNo');
    const displayAmount = document.getElementById('displayAmount');

    if (qrImage) qrImage.src = orderData.qrCodeImage;
    if (displayOrderNo) displayOrderNo.textContent = orderData.orderNo;
    if (displayAmount) displayAmount.textContent = `¥${orderData.amount}`;

    if (modal) {
        modal.classList.add('active');
        // 启动轮询查询订单状态
        startPollingOrder(orderData.orderNo);
    }
}

// 关闭支付弹窗
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.classList.remove('active');
    if (window.pollingInterval) {
        clearInterval(window.pollingInterval);
    }
}

// 轮询查询订单状态
function startPollingOrder(orderNo) {
    // 清除旧的轮询
    if (window.pollingInterval) {
        clearInterval(window.pollingInterval);
    }

    // 每5秒查询一次
    window.pollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/query-order?orderNo=${orderNo}`);
            const data = await response.json();

            if (data.success && data.order.status === 'delivered') {
                clearInterval(window.pollingInterval);
                closePaymentModal();
                showSuccessPage(data.order);
                showToast('支付成功，已自动发货！');
            }
        } catch (error) {
            console.error('查询订单失败:', error);
        }
    }, 5000);
}

// 显示成功页面
function showSuccessPage(order) {
    const orderForm = document.getElementById('orderForm');
    const orderSuccess = document.getElementById('orderSuccess');

    if (orderForm) orderForm.style.display = 'none';
    if (orderSuccess) {
        orderSuccess.style.display = 'block';
        const successOrderNo = document.getElementById('successOrderNo');
        const successContent = document.getElementById('successContent');

        if (successOrderNo) successOrderNo.textContent = order.orderNo;
        if (successContent) successContent.textContent = order.fileContent || '内容加载失败';
    }
}

// ==========================================
// 前台功能：查询订单
// ==========================================

async function queryOrder() {
    const orderNo = document.getElementById('orderNo')?.value.trim();

    if (!orderNo) {
        showToast('请输入订单号', 'error');
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/query-order?orderNo=${orderNo}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || '订单不存在');
        }

        // 显示订单信息
        displayOrderResult(data.order);

    } catch (error) {
        console.error('查询订单失败:', error);
        showToast(error.message || '查询失败，请重试', 'error');
    }
}

function displayOrderResult(order) {
    document.getElementById('querySection').style.display = 'none';
    document.getElementById('orderResult').style.display = 'block';

    const resultTitle = document.getElementById('resultTitle');
    const statusBadge = document.getElementById('statusBadge');
    const orderInfo = document.getElementById('orderInfo');
    const downloadBox = document.getElementById('downloadBox');

    if (order.status === 'delivered') {
        resultTitle.textContent = '🎉 订单已发货';
        statusBadge.innerHTML = '<span class="status-badge status-delivered">已发货</span>';
        orderInfo.innerHTML = `
      <p style="color: var(--text-secondary); margin-top: 16px;">
        订单号：${order.orderNo}<br>
        发货时间：${formatDate(order.deliveredAt)}
      </p>
    `;
        downloadBox.style.display = 'block';
        document.getElementById('downloadContent').textContent = order.fileContent || '内容加载失败';
    } else if (order.status === 'pending') {
        resultTitle.textContent = '⏳ 等待支付';
        statusBadge.innerHTML = '<span class="status-badge status-pending">待支付</span>';
        orderInfo.innerHTML = `
      <p style="color: var(--text-secondary); margin-top: 16px;">
        订单号：${order.orderNo}<br>
        提交时间：${formatDate(order.createdAt)}<br><br>
        请完成支付，支付成功后立即自动发货。
      </p>
    `;
        downloadBox.style.display = 'none';
    } else if (order.status === 'paid') {
        resultTitle.textContent = '⚠️ 库存不足';
        statusBadge.innerHTML = '<span class="status-badge status-pending">已支付</span>';
        orderInfo.innerHTML = `
      <p style="color: var(--text-secondary); margin-top: 16px;">
        订单号：${order.orderNo}<br>
        支付时间：${formatDate(order.paidAt)}<br><br>
        您的付款已收到，但暂时库存不足。店主补货后将立即为您发货。
      </p>
    `;
        downloadBox.style.display = 'none';
    }
}

function resetQuery() {
    document.getElementById('querySection').style.display = 'block';
    document.getElementById('orderResult').style.display = 'none';
    document.getElementById('orderNo').value = '';
}

function copyContent() {
    const content = document.getElementById('downloadContent')?.textContent ||
        document.getElementById('successContent')?.textContent;
    if (!content) return;

    navigator.clipboard.writeText(content).then(() => {
        showToast('已复制到剪贴板');
    }).catch(() => {
        showToast('复制失败，请手动复制', 'error');
    });
}
