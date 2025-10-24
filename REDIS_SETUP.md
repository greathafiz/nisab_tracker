# Redis Cache Setup Guide

## 🎯 Overview

This app uses **Vercel KV (Redis)** for persistent caching of:

- ✅ Current gold/silver prices with 24h change tracking
- ✅ 7-day and 30-day historical price data
- ✅ Multi-currency exchange rates

**Updates daily via cron job** at midnight UTC.

---

## 📋 Required Environment Variables

Add these to your `.env.local` for development and Vercel dashboard for production:

```bash
# Vercel KV (Redis) - Get from Vercel Dashboard
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."

# Metal Prices API (Primary source)
# Get free API key from: https://metalpriceapi.com/
METAL_PRICE_API_KEY="your_metal_price_api_key"

# Gold Price IO (Fallback - Optional)
# Get free API key from: https://goldapi.io/
GOLD_PRICE_IO_API_KEY="your_gold_price_io_api_key"

# Cron Job Security
CRON_SECRET="your_secure_random_string"
```

---

## 🚀 Setup Instructions

### 1. **Create Vercel KV Database**

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** > **KV**
4. Name it: `nisab-tracker-cache`
5. Copy the environment variables automatically added to your project

### 2. **Get Metal Price API Key**

1. Visit [metalpriceapi.com](https://metalpriceapi.com/)
2. Sign up for free tier (100 requests/month)
3. Copy your API key
4. Add to environment variables

### 3. **Generate Cron Secret**

```bash
# Generate a secure random string
openssl rand -base64 32
```

Add this to your environment variables as `CRON_SECRET`.

### 4. **Configure Vercel Cron Job**

The `vercel.json` already includes the cron configuration:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-update",
      "schedule": "0 0 * * *"
    }
  ]
}
```

After deploying, the cron job will automatically run daily at midnight UTC.

---

## 🔄 Manual Cache Update

During development or to force a cache update:

```bash
# Make sure your .env.local is configured
# Then call the cron endpoint manually:
curl -X GET http://localhost:3000/api/cron/daily-update \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📊 Cache Keys in Redis

| Key                 | Description                        | TTL |
| ------------------- | ---------------------------------- | --- |
| `metals:current`    | Current gold/silver prices         | 24h |
| `metals:previous`   | Previous day prices (for % change) | 24h |
| `metals:historical` | 7-day + 30-day price history       | 24h |
| `exchange:rates`    | Multi-currency exchange rates      | 24h |

---

## 🧪 Testing Locally

1. **Start Redis locally** (optional - for testing without Vercel KV):

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Then use local Redis URL
KV_URL="redis://localhost:6379"
```

2. **Run development server**:

```bash
npm run dev
```

3. **Test the cron endpoint**:

```bash
curl -X GET http://localhost:3000/api/cron/daily-update \
  -H "Authorization: Bearer $CRON_SECRET"
```

4. **Check if data is cached**:

```bash
# Visit your app
http://localhost:3000/

# Check API endpoints
http://localhost:3000/api/nisab?currency=USD&rate=1
http://localhost:3000/api/exchange-rates
```

---

## 🎯 API Endpoints

### `/api/nisab`

Get current Nisab values in any currency.

**Query params:**

- `currency`: Currency code (USD, GBP, EUR, etc.)
- `rate`: Exchange rate from USD

**Example:**

```
GET /api/nisab?currency=GBP&rate=0.745
```

### `/api/exchange-rates`

Get all cached exchange rates.

**Example:**

```
GET /api/exchange-rates
```

### `/api/cron/daily-update`

Cron job endpoint (requires authorization).

**Example:**

```
GET /api/cron/daily-update
Authorization: Bearer YOUR_CRON_SECRET
```

---

## 📈 API Usage Tracking

**Daily API calls:**

- metalpriceapi.com: 3 calls (current + 7d + 30d history)
- exchangerate-api.com: 1 call

**Monthly total:**

- Metal prices: ~90 calls (below 100 free tier limit)
- Exchange rates: ~30 calls (well below 1500 free tier limit)

---

## 🐛 Troubleshooting

### Cache not updating?

1. Check Vercel cron job logs in dashboard
2. Verify `CRON_SECRET` matches in cron request
3. Check API keys are valid

### Redis connection errors?

1. Verify Vercel KV environment variables are set
2. Check KV database is active in Vercel dashboard
3. Restart your development server

### API rate limits?

1. Monitor API usage in provider dashboards
2. Consider upgrading to paid tier if needed
3. Fallback mechanisms are in place for all APIs

---

## 🎉 Architecture Benefits

✅ **Persistent caching** - Survives hard reloads and cold starts
✅ **Multi-tier fallbacks** - 3 API sources for resilience  
✅ **Single source of truth** - All data flows through backend
✅ **Efficient** - 1 API call per day serves all users
✅ **Cost-effective** - Free tier friendly (90/100 monthly limit)
✅ **Real-time price changes** - Tracks 24h % changes

---

## 📝 Next Steps

1. ✅ Set up Vercel KV in dashboard
2. ✅ Add environment variables
3. ✅ Deploy to Vercel
4. ✅ Verify cron job runs successfully
5. ✅ Monitor API usage
6. 🚀 Build historical chart component (data is ready!)

---

## 🔗 Useful Links

- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Metal Price API](https://metalpriceapi.com/)
- [Exchange Rate API](https://www.exchangerate-api.com/)
