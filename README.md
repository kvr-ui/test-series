# Video Insights (MERN)

The FOCAS Edu "Video Insights" landing page (mentor video reviews + plan pricing) as a standalone
MongoDB / Express / React / Node app.

Buying happens on the site's own checkout: a pricing button opens `/checkout`, the buyer enters
their details, pays through the Razorpay payment popup (UPI, cards, net banking, wallets), and lands
on `/order/<orderNumber>`. Orders are stored in MongoDB; prices always come from the page content in
the database, never from the browser.

## Structure

```
client/                 React 18 + Vite + Tailwind 3
  public/               hero image, logo, privacy/terms PDFs
  src/components/       one component per page section
  src/pages/            Checkout and OrderStatus pages
  src/lib/plans.js      plan copy shared by pricing and checkout
  src/lib/video.js      Bunny / HLS / YouTube URL handling
server/                 Express + Mongoose
  src/data/videoInsightsPage.js   seed copy for every section
  src/data/plans.js               validates a selection and prices it from the page content
  src/lib/razorpay.js             Razorpay order creation + signature checks
  src/models/Order.js             checkout orders
  src/routes/pages.js             GET/PUT /api/pages/:slug
  src/routes/checkout.js          quote, orders, payment verification, webhook
```

## Getting started

Requires Node 20+ and a MongoDB instance.

```bash
npm install
cp server/.env.example server/.env   # adjust MONGODB_URI etc.
npm run dev
```

- Client: http://localhost:5173 (proxies `/api` to the server)
- API: http://localhost:5000

On first boot the server creates the `video-insights` page in MongoDB from the seed file.

## Production

```bash
npm run build     # builds client/dist
NODE_ENV=production npm start
```

The Express server serves `client/dist` along with the API, so one Node process hosts the whole
site. To host the client separately, build it with `VITE_API_URL=https://api.example.com` and set
`CORS_ORIGIN` on the server.

## Environment (`server/.env`)

| Variable            | Purpose                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `PORT`              | API port (default 5000)                                              |
| `MONGODB_URI`       | Mongo connection string                                              |
| `SITE_URL`          | Optional logo link target (defaults to this site's home page)        |
| `RAZORPAY_KEY_ID`   | Razorpay API key id (`rzp_test_…` locally, `rzp_live_…` in production) |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret. Checkout is disabled until both keys are set |
| `RAZORPAY_WEBHOOK_SECRET` | Secret of the Razorpay webhook pointing at `/api/checkout/webhook` |
| `CORS_ORIGIN`       | Optional comma-separated origins allowed to call the API             |
| `ADMIN_TOKEN`       | Enables `PUT /api/pages/:slug` and the admin order list; empty disables both |

## API

| Method | Path                      | Notes                                                        |
| ------ | ------------------------- | ------------------------------------------------------------ |
| GET    | `/api/health`             | Liveness check                                               |
| GET    | `/api/pages/video-insights` | Page copy plus `config.siteUrl`                            |
| PUT    | `/api/pages/video-insights` | Header `x-admin-token`; body `{ title?, description?, sections }` (full replace) |
| GET    | `/api/checkout/quote`     | Query `level, type, item, plan` → validated plan and price   |
| POST   | `/api/checkout/orders`    | Body `{ selection, customer: { name, email, phone } }` → Razorpay order for the popup |
| POST   | `/api/checkout/orders/:orderNumber/verify` | Razorpay handler response → marks the order paid if the signature matches |
| GET    | `/api/checkout/orders/:orderNumber` | Order status for the confirmation page (no email/phone) |
| POST   | `/api/checkout/webhook`   | Razorpay webhook (`order.paid`, `payment.captured`, `payment.failed`) |
| GET    | `/api/checkout/admin/orders` | Header `x-admin-token`; optional `?status=paid` — full order list with customer details |

## Editing content

- **Copy, videos, prices:** edit `server/src/data/videoInsightsPage.js` and run `npm run seed`
  (overwrites the page in MongoDB), or send the new `sections` to the PUT endpoint.
- **Videos** accept the same links the theme did: Bunny Stream embed/share links, Bunny HLS
  playlists (`.../playlist.m3u8`), direct video files, or a YouTube ID in `video_id`.
- **Prices:** checkout charges whatever `pricing.pricing_by_type` holds in MongoDB, so a price
  change through the seed or the PUT endpoint applies to checkout immediately.

## Payments setup

1. In the Razorpay Dashboard create API keys and put them in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
2. Add a webhook to `https://<your-domain>/api/checkout/webhook` with events `order.paid`,
   `payment.captured` and `payment.failed`, and copy its secret into `RAZORPAY_WEBHOOK_SECRET`.
   The webhook records payments even if the buyer closes the tab before returning to the site.
3. Keep automatic payment capture enabled in Razorpay (the default).
4. See paid orders with `curl -H "x-admin-token: $ADMIN_TOKEN" https://<your-domain>/api/checkout/admin/orders?status=paid`.
# test-series
