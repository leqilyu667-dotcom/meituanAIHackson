# 妙手 Backend

Go + Gin + GORM + SQLite 后端服务，为妙手美甲平台提供 RESTful API。

## 快速启动

```bash
# 1. 安装 Go 1.22+
# 2. 进入后端目录
cd backend

# 3. 下载依赖
go mod tidy

# 4. 启动服务（自动建库 + 初始化种子数据）
go run main.go

# 服务运行在 http://localhost:8080
```

## 项目结构

```
backend/
├── main.go                 # 入口
├── go.mod                  # 依赖
├── config/config.go        # 配置（端口/JWT密钥/CORS）
├── database/database.go    # 数据库连接 + 自动迁移
├── models/models.go        # GORM 模型（15+ 张表）
├── handlers/handlers.go    # API handlers（60+ 端点）
├── middleware/auth.go      # JWT认证 + CORS
├── router/router.go        # 路由配置
├── seed/seed.go            # Demo 种子数据
└── utils/response.go       # 统一响应格式
```

## API 端点

### 认证
| Method | Path | Auth |
|--------|------|------|
| POST | `/v1/auth/send-code` | 无 |
| POST | `/v1/auth/login` | 无 |
| GET | `/v1/auth/profile` | JWT |

### 配置
| Method | Path | Auth |
|--------|------|------|
| GET | `/v1/labels/system` | 无 |
| GET | `/v1/labels/dimensions` | 无 |
| GET | `/v1/appointment-status` | 无 |
| GET | `/v1/categories` | 无 |

### 款式 / 灵感
| Method | Path | Auth |
|--------|------|------|
| GET | `/v1/products` | 无 |
| GET | `/v1/products/:id` | 无 |
| GET | `/v1/inspiration-themes` | 无 |

### 店铺 / 美甲师
| Method | Path | Auth |
|--------|------|------|
| GET | `/v1/salons` | 无 |
| GET | `/v1/salons/:id` | 无 |
| GET | `/v1/salons/:id/artists` | 无 |
| GET | `/v1/artists` | 无 |
| GET | `/v1/artists/:id` | 无 |
| GET | `/v1/artists/:id/works` | 无 |
| GET | `/v1/artists/:id/reviews` | 无 |

### 预约
| Method | Path | Auth |
|--------|------|------|
| POST | `/v1/reservations` | JWT |
| GET | `/v1/reservations` | JWT |
| GET | `/v1/reservations/:id` | JWT |
| PUT | `/v1/reservations/:id/confirm` | JWT |
| PUT | `/v1/reservations/:id/cancel` | JWT |
| PUT | `/v1/reservations/:id/complete` | JWT |
| PUT | `/v1/reservations/:id/change` | JWT |

### 订单 / 评价
| Method | Path | Auth |
|--------|------|------|
| GET | `/v1/orders` | JWT |
| GET | `/v1/orders/:id` | JWT |
| POST | `/v1/reviews` | JWT |

### 消息 / 群聊
| Method | Path | Auth |
|--------|------|------|
| GET | `/v1/conversations` | JWT |
| GET | `/v1/conversations/:id/messages` | JWT |
| POST | `/v1/conversations/:id/messages` | JWT |

### 试戴
| Method | Path | Auth |
|--------|------|------|
| POST | `/v1/tryon/generate` | JWT |
| POST | `/v1/tryon/log` | JWT |
| GET | `/v1/tryon/history` | JWT |

### 商家后台
| Method | Path | Auth |
|--------|------|------|
| GET | `/v1/merchant/daily-report` | JWT(B) |
| GET | `/v1/merchant/appointments` | JWT(B) |
| GET | `/v1/merchant/orders` | JWT(B) |
| GET | `/v1/merchant/stats` | JWT(B) |
| GET | `/v1/merchant/hot-tags` | JWT(B) |

### 开发调试
| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | 无 |
| GET | `/debug/routes` | 无 |
| GET | `/v1/mock/all` | 无 |

## Demo 模式

- **登录**：任意手机号 + 6位验证码即可登录（自动注册）
- **试戴**：直接返回款式图作为"试戴结果"（无需 GPU）
- **自动回复**：群聊发送消息后 1 秒自动 AI 回复
- **数据**：启动时自动创建 SQLite 数据库 + 填充种子数据

## 前端对接

前端 `vite.config.js` 添加代理：

```js
server: {
  proxy: {
    '/v1': 'http://localhost:8080',
    '/health': 'http://localhost:8080'
  }
}
```

然后前端 API 调用直接使用相对路径即可。
