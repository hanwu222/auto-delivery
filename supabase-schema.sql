-- ==========================================
-- Supabase 数据库表创建脚本
-- ==========================================

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 库存文件表
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_sold BOOLEAN DEFAULT FALSE,
  order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT UNIQUE NOT NULL,
  contact TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  trade_no TEXT,
  file_id UUID REFERENCES files(id),
  file_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_files_is_sold ON files(is_sold);

-- 插入默认商品
INSERT INTO products (name, price, description) 
VALUES ('成品账号', 45.00, '即买即用，自动发货')
ON CONFLICT DO NOTHING;

-- 提示信息
COMMENT ON TABLE products IS '商品信息表';
COMMENT ON TABLE files IS '库存文件表';
COMMENT ON TABLE orders IS '订单表';
