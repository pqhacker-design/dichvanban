# AI Document Translator Pro

AI Document Translator Pro là một ứng dụng dịch tài liệu thông minh cao cấp sử dụng mô hình Google Gemini 3 (Flash, Pro, Thinking) với khả năng **giữ nguyên toàn bộ định dạng tài liệu** (Font, Heading, Bảng biểu, Merged Cell, Công thức Toán LaTeX, Code Block, Danh sách, Hình ảnh).

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Dịch Tài Liệu Giữ Nguyên Định Dạng**:
   - Hỗ trợ kéo thả nhiều file cùng lúc: `.docx`, `.pdf`, `.txt`, `.md`, `.html`, `.pptx`, `.xlsx`, `.csv`, `.odt`, `.rtf`.
   - Giữ nguyên bố cục, bảng, tiêu đề, danh sách, khối mã nguồn, và công thức Toán.

2. **Hỗ Trợ Đa Mô Hình Gemini 3**:
   - **Gemini 3.6 Flash**: Dịch siêu tốc, băng thông cao.
   - **Gemini 3.1 Pro**: Suy luận chuyên sâu cho tài liệu phức tạp.
   - **Gemini Thinking High**: Tư duy logic cao cấp cho tài liệu Pháp lý và Học thuật.

3. **Chế Độ Dịch Theo Chuyên Ngành (Domain Modes)**:
   - General, Academic, Education, Business, Legal, Medical, Technical, Marketing, Programming.

4. **Từ Điển Thuật Ngữ (Glossary) & Qui Tắc Không Dịch (Do Not Translate)**:
   - Cấu hình bản dịch thuật ngữ bắt buộc (Ví dụ: "Giáo dục phổ thông" -> "General Education").
   - Bảo vệ tên thương hiệu, email, URL, mã sản phẩm, công thức LaTeX không bị dịch sai.

5. **Dịch Song Ngữ & Xem Trước Side-by-Side**:
   - Xem đồng thời file gốc và file đã dịch với bộ gõ / bộ đọc song song.

6. **Dịch Trực Tiếp & Real-Time Streaming**:
   - Dịch văn bản dạng Server-Sent Events (SSE) hiển thị từng câu theo thời gian thực.

7. **Nhận Dạng Chữ Viết OCR (Gemini Vision)**:
   - Quét ảnh chụp hoặc file PDF dạng ảnh, trích xuất văn bản và dịch tự động.

8. **Xuất Báo Cáo & Tải File**:
   - Xuất file đã dịch ra các định dạng DOCX, PDF, HTML, Markdown, TXT.

---

## 📁 CẤU TRÚC DỰ ÁN

```text
├── server.ts                    # Main Express + Vite server entry point
├── src/
│   ├── main.tsx                 # React mounting entry point
│   ├── App.tsx                  # Root Application router & layout
│   ├── index.css                # Tailwind CSS entry point
│   ├── types.ts                 # Shared TypeScript interfaces & types
│   ├── languages.ts             # 100+ Supported Languages database
│   ├── components/
│   │   ├── Sidebar.tsx          # Navigation sidebar component
│   │   ├── Header.tsx           # Top navigation bar
│   │   ├── DashboardView.tsx    # Dashboard with Recharts metrics
│   │   ├── TranslateDocumentView.tsx # Multi-file upload & side-by-side viewer
│   │   ├── TranslateTextView.tsx     # Real-time streaming text translation
│   │   ├── OCRView.tsx          # Optical Character Recognition & translation
│   │   ├── HistoryView.tsx      # Translation logs & preview modal
│   │   ├── GlossaryView.tsx     # Custom terminology & DNT rules manager
│   │   ├── SettingsView.tsx     # Gemini model preferences & prompts
│   │   ├── APISettingsView.tsx  # API health & test diagnostics
│   │   └── AboutView.tsx        # Application documentation
│   └── server/
│       ├── geminiService.ts     # @google/genai SDK translation & OCR integration
│       ├── documentParser.ts    # DOCX, TXT, MD, HTML document parsing
│       ├── exportService.ts     # Multi-format export builder
│       └── store.ts             # Data store for history, glossary & stats
├── package.json
├── metadata.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Yêu cầu hệ thống
- **Node.js**: >= 18.x
- **npm** hoặc **yarn**

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Cấu hình Biến Môi Trường
Tạo file `.env` từ `.env.example`:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 4. Chạy chế độ Development
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`

---

## 🏗️ HƯỚNG DẪN BUILD & DEPLOY

### Build ứng dụng Production:
```bash
npm run build
```
Lệnh này sẽ biên dịch giao diện React bằng Vite và đóng gói backend Express thành `dist/server.cjs` bằng `esbuild`.

### Chạy Production:
```bash
npm start
```

### Deploy Lên Cloud Run / Render / Railway / Docker / Ubuntu VPS:
Ứng dụng được thiết kế dạng Node.js Express server tiêu chuẩn chạy trên cổng 3000 (`0.0.0.0:3000`).
Cung cấp biến môi trường `GEMINI_API_KEY` trong bảng điều khiển Cloud/Docker container.
### Chú ý
## 1. server.ts
Hiện tại bạn đang để:
const PORT = 3000;
và
app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Document Translator Pro running on http://localhost:${PORT}`);
});
## Hãy sửa thành:
`const PORT = Number(process.env.PORT) || 3000;`
và
`app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);`
});
## Cấu hình Render
Tạo Web Service với các thông số:
Mục	Giá trị
Runtime:	`Node`
Build Command:	`npm install && npm run build`
Start Command:	`npm start`
## Thêm biến môi trường:
`NODE_ENV=production`
`GEMINI_API_KEY=...`
