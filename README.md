# Hugging Face Image Generator

Một web app Next.js 14 tối giản để test Hugging Face Inference API cho việc tạo ảnh nhanh chóng.

## Stack Công nghệ

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Ngôn ngữ**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **API**: Next.js API Routes (Edge/Node compatible)
- **Deployment**: Sẵn sàng để deploy trên Vercel, Replit, hoặc bất kỳ nền tảng hỗ trợ Node.js nào.

## Tính năng

- **Frontend đơn giản**: Một trang duy nhất với form nhập liệu và gallery hiển thị kết quả.
- **Chọn Model**: Hỗ trợ hai model phổ biến:
  - `black-forest-labs/FLUX.1-schnell`
  - `stabilityai/stable-diffusion-xl-base-1.0`
- **Tùy chỉnh tham số**: Cho phép người dùng điều chỉnh các tham số như `width`, `height`, `steps`, `guidance_scale`, và `negative_prompt`.
- **Tạo ảnh trực tiếp**: Gọi đến Hugging Face Inference API và nhận về ảnh dưới dạng nhị phân (`image/png`).
- **Hiển thị và Tải xuống**: Hiển thị ảnh đã tạo bằng Blob URL và cung cấp nút tải xuống.
- **Lịch sử ảnh**: Lưu và hiển thị 6 ảnh đã tạo gần nhất.
- **Bảo mật**: Đọc `HF_TOKEN` từ biến môi trường để đảm bảo an toàn.

## Cài đặt và Chạy Local

### 1. Clone Repository

```bash
git clone https://github.com/sgotek/fluxhugging.git
cd fluxhugging
```

### 2. Cài đặt Dependencies

Sử dụng `npm` để cài đặt các gói cần thiết:

```bash
npm install
```

### 3. Cấu hình Biến môi trường

Bạn cần có một Hugging Face API Token để sử dụng ứng dụng. Lấy token của bạn tại [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).

1.  Tạo một file `.env.local` ở thư mục gốc của dự án.
2.  Thêm token của bạn vào file này:

    ```env
    # .env.local
    HF_TOKEN=your_hugging_face_token_here
    ```

    **Lưu ý**: File `.env.local` đã được thêm vào `.gitignore` để tránh commit token lên repository.

### 4. Chạy Development Server

Khởi động server development Next.js:

```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000).

### 5. Build cho Production

Để tạo một bản build tối ưu cho production, chạy lệnh sau:

```bash
npm run build
```

Sau đó, bạn có thể khởi động server production với `npm start`.

## Triển khai trên Vercel

1. **Import Repository**: Vào [Vercel](https://vercel.com) và import repository từ GitHub.
2. **Cấu hình Environment Variables**: Trong Vercel dashboard, thêm biến môi trường:
   - **Key**: `HF_TOKEN`
   - **Value**: `your_hugging_face_token_here`
3. **Deploy**: Vercel sẽ tự động build và deploy ứng dụng.

## Triển khai trên Replit

1.  **Import Repository**: Tạo một Replit mới và import repository từ GitHub.
2.  **Cấu hình Secrets**: Trong Replit, vào tab "Secrets" (biểu tượng ổ khóa) và tạo một secret mới:
    -   **Key**: `HF_TOKEN`
    -   **Value**: `your_hugging_face_token_here`
3.  **Chạy ứng dụng**: Replit sẽ tự động phát hiện cấu hình `npm run dev` hoặc bạn có thể cấu hình file `.replit` để sử dụng `npm start` sau khi build.
4.  Nhấn nút "Run" để khởi động ứng dụng.

## Demo

Xem demo trực tiếp tại: [Demo Link sẽ được cập nhật sau khi deploy]

## API Endpoints

### POST /api/generate

Tạo ảnh từ text prompt.

**Request Body:**
```json
{
  "model": "flux" | "sdxl",
  "prompt": "string",
  "negative_prompt": "string (optional)",
  "width": number,
  "height": number,
  "steps": number,
  "guidance_scale": number
}
```

**Response:**
- Success: Binary image data (image/png)
- Error: JSON với thông tin lỗi

## Giá trị mặc định

- **FLUX.1-schnell**: steps=20, guidance_scale=3.5, width=768, height=1024
- **SDXL**: steps=30, guidance_scale=7.5, width=768, height=1024
- **Negative prompt mặc định**: "low quality, blurry, watermark, text"

## License

MIT License
