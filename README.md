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
- `START_DATE` (YYYY-MM-DD)
- `WEATHER_LAT`
- `WEATHER_LON`
- `QWEN_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_TO` (comma separated)

Optional (defaults in code):
- `TIMEZONE` (default `Asia/Shanghai`)
- `WEATHER_CITY`
- `QWEN_MODEL` (default `qwen-plus`)
- `QWEN_BASE_URL` (default `https://dashscope.aliyuncs.com/compatible-mode/v1`)
- `EMAIL_SUBJECT` (default `早安`)

## Deploy

1. Install deps: `npm install`
2. Set secrets (example):
   - `wrangler secret put QWEN_API_KEY`
   - `wrangler secret put RESEND_API_KEY`
   - `wrangler secret put EMAIL_FROM`
   - `wrangler secret put EMAIL_TO`
   - `wrangler secret put START_DATE`
   - `wrangler secret put WEATHER_LAT`
   - `wrangler secret put WEATHER_LON`
3. Deploy: `wrangler deploy`

## Notes

- Cron 使用 UTC，`08:30 Asia/Shanghai == 00:30 UTC`，已写在 `wrangler.toml`。
- 不使用存储；若执行失败被平台重试，可能会出现重复邮件。
