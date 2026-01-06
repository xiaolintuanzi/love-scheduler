# LoveScheduler

A scheduler that sends love on time — daily weather, outfit suggestions, and a growing count of days together.
一个准时发送爱的调度器：每日天气、穿衣建议，以及不断增长的在一起天数。

## Overview

- Cloudflare Workers Cron 触发，每天固定时间运行
- 天气来源：Open-Meteo（无需天气 API Key）
- AI 文案：千问（OpenAI 兼容接口）
- 邮件发送：Resend

## Environment Variables

Required:
- `QWEN_API_KEY`
- `RESEND_API_KEY`

Other settings live in `src/app-config.ts` (start date, location, email targets, model, etc).

## Deploy

1. Install deps: `npm install`
2. Update `src/app-config.ts` with your local settings.
3. Set secrets (example):
   - `wrangler secret put QWEN_API_KEY`
   - `wrangler secret put RESEND_API_KEY`
4. Deploy: `wrangler deploy`

## Notes

- Cron 使用 UTC，`08:30 Asia/Shanghai == 00:30 UTC`，已写在 `wrangler.toml`。
- 不使用存储；若执行失败被平台重试，可能会出现重复邮件。
