# Blog Backend

个人博客后端服务，基于 NestJS + TypeScript + MySQL 构建。

## 技术栈

NestJS v11 / TypeScript / MySQL 8.0 / TypeORM / JWT + Passport / WebSocket / Pino / 腾讯云 COS / Docker / PM2

## 功能

- 博客文章、标签、分类管理
- JWT 认证 + GitHub OAuth 登录
- 微信小程序认证
- WebSocket 在线状态推送
- 文件上传（本地 + COS）
- 邮箱验证码
- AI 集成（DeepSeek）
- 多端控制器（Admin / 前端 / 小程序）

## 快速开始

```bash
# 环境要求: Node.js 20.19.4, MySQL 8.0
nvm use
npm install
cp .env.development .env
docker-compose up -d          # 启动 MySQL（可选）
npm run migration:run          # 数据库迁移
npm run start:dev              # 启动开发服务
```

## 常用命令

```bash
npm run start:dev              # 开发模式
npm run build                  # 构建
npm run start:prod             # 生产模式
npm run lint                   # 代码检查
npm run migration:generate     # 生成迁移
npm run migration:run          # 执行迁移
npm run migration:revert       # 回滚迁移
```

## 生产部署

```bash
npm run build
npm run migration:run:prod
pm2 start ecosystem.config.js
```

## 环境变量

参考 `.env.development` 配置，主要包含：

- `DB_*` — 数据库连接
- `JWT_SECRET` — JWT 密钥
- `EMAIL_*` — 邮件服务
- `GITHUB_*` — GitHub OAuth
- `COS_*` — 腾讯云对象存储
- `MINIAPP_*` — 微信小程序
- `DEEPSEEK_*` — AI 服务

## License

本项目为个人博客项目，仅供学习参考。
