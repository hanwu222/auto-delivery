# 支付宝自动发货系统 - 部署指南

## 📋 前置准备

确保您已完成：
- ✅ 支付宝开放平台注册
- ✅ 创建应用并获得AppID: `2021006131686011`
- ✅ 生成并上传应用公钥
- ✅ 保存应用私钥文件
- ✅ Supabase账号和项目
- ✅ Vercel账号

---

## 步骤一：配置Supabase数据库

1. **登录Supabase** → 进入您的项目
2. **打开SQL Editor** (左侧菜单)
3. **复制粘贴** `supabase-schema.sql` 文件的内容
4. **点击Run** 执行SQL创建表

---

## 步骤二：安装依赖

在项目目录打开PowerShell：

```powershell
cd "d:\odv\OneDrive - stu.xmu.edu.cn\Attachments\antigravity"
npm install
```

---

## 步骤三：配置支付宝回调地址

1. 登录 [支付宝开放平台](https://open.alipay.com)
2. 进入您的应用 → 开发设置
3. 找到 **"授权回调地址"** 或 **"网关地址"**
4. 先保留空白，部署后再配置

---

## 步骤四：部署到Vercel

### 方法一：命令行部署（推荐）

```powershell
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署
vercel
```

### 方法二：网页部署

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Add New" → "Project"
3. 将项目上传或关联GitHub仓库
4. 点击 "Deploy"

---

## 步骤五：配置环境变量

部署完成后，在Vercel项目设置中添加环境变量：

1. 进入项目 → Settings → Environment Variables
2. 添加以下变量：

| 变量名 | 值 |
|--------|------|
| `ALIPAY_APP_ID` | `2021006131686011` |
| `ALIPAY_PRIVATE_KEY` | 您的应用私钥（完整内容） |
| `ALIPAY_PUBLIC_KEY` | 支付宝公钥（从开放平台获取） |
| `SUPABASE_URL` | `https://hgkllfxbsihmtbovbnua.supabase.co` |
| `SUPABASE_ANON_KEY` | `sb_publishable_HqYlJX3ouvI0pCOc8hJPag__bEdor8g` |
| `ADMIN_PASSWORD` | 您的管理密码（建议修改） |

> ⚠️ **应用私钥格式**：需要包含`-----BEGIN RSA PRIVATE KEY-----`和`-----END RSA PRIVATE KEY-----`

3. 保存后重新部署

---

## 步骤六：配置支付宝回调地址

1. 获取您的Vercel部署网址，例如：`https://your-project.vercel.app`
2. 回到支付宝开放平台
3. 配置回调地址为：`https://your-project.vercel.app/api/alipay-callback`
4. 保存

---

## 步骤七：上传库存

1. 访问后台：`https://your-project.vercel.app/admin.html`
2. 使用您设置的管理密码登录
3. 点击"批量上传库存"
4. 每行一个账号信息，点击上传

---

## 步骤八：测试

### 测试支付流程
1. 访问首页
2. 填写联系方式
3. 点击"立即购买"
4. 扫描二维码支付小额测试（如¥0.01）
5. 支付后查看是否自动发货

### 检查回调日志
在Vercel项目中查看Function Logs，确认支付回调是否正常接收。

---

## ⚠️ 常见问题

### 1. 支付后没有自动发货
- 检查Vercel Function Logs查看错误
- 确认支付宝回调地址配置正确
- 验证应用私钥和公钥是否正确

### 2. 库存不足
- 登录后台查看库存数量
- 及时补充库存文件

### 3. 签名验证失败
- 确认应用私钥格式正确
- 检查支付宝公钥是否为最新版本

---

## ✅ 完成

部署成功后，您的自动发货系统将24小时运行，自动处理所有订单！
