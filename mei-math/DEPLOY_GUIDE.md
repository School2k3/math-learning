# Hướng dẫn Deploy Frontend lên Vercel/Railway

## Vấn đề và Giải pháp

### 1. Hình ảnh 404 - ĐANG ĐÚNG RỒI
- Hình ảnh trong `/public` đã đúng path: `/logo-Photoroom.png`, `/banner-home-img.png`
- **KHÔNG CẦN SỬA GÌ** - Vercel sẽ tự copy folder `public/` khi build

### 2. API 404 - CẦN CẤU HÌNH

#### Bước 1: Deploy Backend trước
1. Deploy backend Node.js lên Railway
2. Lấy URL backend, ví dụ: `https://mei-math.up.railway.app`

#### Bước 2: Cấu hình biến môi trường trên Vercel
1. Vào Vercel Dashboard → Your Project → Settings → Environment Variables
2. Thêm biến:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://mei-math.up.railway.app` (URL backend Railway của bạn)
   - **Environments**: Chọn Production, Preview, Development

#### Bước 3: Cấu hình CORS trên Backend
Trong file backend (ví dụ `server.js` hoặc `app.js`), thêm:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://math-learning-43d8.vercel.app', // URL Vercel của bạn
    'https://your-custom-domain.com' // Nếu có custom domain
  ],
  credentials: true
}));
```

#### Bước 4: Update API calls trong code
Tôi đã tạo file `src/config/api.ts` với helper function `buildApiUrl()`.

**CẦN SỬA** trong tất cả file API (`src/api/*.ts`):

Từ:
```typescript
const response = await fetch("/api/chapters");
```

Thành:
```typescript
import { buildApiUrl } from '../config/api';
const response = await fetch(buildApiUrl("/api/chapters"));
```

**Danh sách file cần sửa:**
- src/api/chapterAPI.ts
- src/api/lessonAPI.ts
- src/api/examAPI.ts
- src/api/questionAPI.ts
- src/api/uploadAPI.ts
- src/api/answers.ts
- src/api/loginAPI.ts
- src/api/registerAPI.ts
- src/api/otpAPI.ts
- src/api/praticeAPI.ts
- src/api/lessonReviewAPI.ts
- src/api/userStatsAPI.ts

#### Bước 5: Rebuild và Redeploy
```bash
npm run build
```

Sau đó push code lên Git, Vercel sẽ tự động rebuild.

## Tóm tắt các file đã tạo:
1. `.env.production` - Chứa `VITE_API_BASE_URL` cho production
2. `.env.development` - Chứa `VITE_API_BASE_URL` cho local development  
3. `src/config/api.ts` - Helper function để build API URLs

## Lưu ý quan trọng:
- File `.env.production` CHỈ để tham khảo, KHÔNG được commit lên Git
- Phải cấu hình biến môi trường trực tiếp trên Vercel Dashboard
- Backend PHẢI deploy trước và enable CORS cho frontend domain
