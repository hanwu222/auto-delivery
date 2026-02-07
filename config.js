// ==========================================
// 配置文件 - API版本
// ==========================================

const CONFIG = {
  // API 基础URL（Vercel部署后会自动使用生产环境URL）
  API_BASE_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api',

  // 管理员密码（请修改为复杂密码）
  ADMIN_PASSWORD: 'admin123',

  // 商品信息
  PRODUCT: {
    name: '成品账号',
    price: 45,
    currency: 'CNY'
  },

  // 支付宝配置（前端展示用）
  ALIPAY: {
    appId: '2021006131686011'
  }
};

console.log('📦 使用API模式');
