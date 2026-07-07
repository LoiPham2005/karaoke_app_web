# 🎨 Karaoke Frontend (Next.js 14)

Frontend cho ứng dụng karaoke "SingNow" - kiểu YouTube wrapper với lyrics đồng bộ.

## 📦 Stack

- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS** + shadcn/ui (Radix primitives)
- **Lucide icons**
- **Zustand** (UI state)
- **next-themes** (Dark mode)

> **Lưu ý**: Giai đoạn này chỉ build UI với mock data, chưa ghép API backend.

## 🚀 Cách chạy

```bash
cd frontend
npm install
npm run dev
```

Mở `http://localhost:3001`

## 📁 Cấu trúc

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login, register, forgot-password
│   │   ├── (main)/         # Trang app chính có sidebar
│   │   ├── (player)/       # Player fullscreen
│   │   ├── admin/          # Admin panel
│   │   ├── page.tsx        # Landing
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── ui/             # shadcn primitives
│   │   ├── layout/         # Sidebar, Topbar, MiniPlayer
│   │   ├── songs/          # SongCard, SongRow
│   │   ├── player/         # LyricsHighlight
│   │   └── common/         # Logo
│   ├── lib/utils.ts        # cn(), formatDuration...
│   ├── mocks/              # Mock data (songs, playlists, lyrics...)
│   └── types/              # TypeScript types
```

## 🎯 Routes đã build

### Public (không cần đăng nhập)
- [x] `/` — Landing page
- [x] `/login` — Đăng nhập
- [x] `/register` — Đăng ký
- [x] `/forgot-password` — Quên mật khẩu

### App pages
- [x] `/home` — Trang chủ Discover (trending, đề xuất, thể loại)
- [x] `/search` — Tìm kiếm
- [x] `/song/[id]` — Chi tiết bài hát
- [x] `/play/[id]` — **Player karaoke + lyrics đồng bộ** ⭐
- [x] `/library` — Thư viện (playlist/yêu thích/lịch sử)
- [x] `/playlist/[id]` — Chi tiết playlist
- [x] `/queue` — Hàng chờ phát
- [x] `/category/[slug]` — Bài theo thể loại
- [x] `/profile` — Profile cá nhân
- [x] `/settings` — Cài đặt (7 tabs)

### Admin
- [x] `/admin` — Dashboard
- [x] `/admin/users` — Quản lý người dùng
- [x] `/admin/reports` — Báo cáo bài lỗi
- [x] `/admin/lyrics` — Duyệt lyrics đóng góp

### Utility
- [x] 404 page

## 🎨 Design System

- **Theme**: Dark mode chủ đạo (hợp karaoke), có chế độ Light
- **Primary**: `#FF3D71` (hồng karaoke)
- **Secondary**: `#8B5CF6` (tím)
- **Font**: Inter + Be Vietnam Pro (đẹp cho tiếng Việt)
- **Border radius**: 0.75rem (xl)

## ✨ Tính năng nổi bật

### Player Page (`/play/[id]`)
- Video YouTube (placeholder)
- Lyrics highlight đồng bộ theo timestamp
- Click vào dòng lyrics để tua đến đúng vị trí
- 4 size font: S/M/L/XL
- TV mode (fullscreen)
- Queue sidebar
- Player controls: play/pause, prev/next, shuffle, loop, volume

### Home Page
- Hero banner với bài đang hot
- Trending grid
- Categories với gradient màu
- Recommended horizontal scroll
- Top charts

### Lyrics đồng bộ
- Parse file `.lrc` chuẩn
- Active line: scale 1.1, màu primary, glow effect
- Passed lines: opacity giảm
- Auto-scroll giữ active line ở giữa

## 🛠️ Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Dev mode, port 3001 |
| `npm run build` | Build production |
| `npm start` | Chạy production |
| `npm run lint` | Lint |
| `npm run format` | Prettier format |

## 📌 Bước tiếp theo

1. Cài deps: `npm install`
2. Chạy thử: `npm run dev` → mở localhost:3001
3. Khi nào ghép API: thay `src/mocks/` bằng service gọi backend
4. Thêm các page chưa build:
   - Room page (`/room/[code]`) — phòng hát chung realtime
   - Feed (`/feed`) — newsfeed bạn bè
   - User public (`/u/[username]`)
   - Verify email, Reset password
   - Maintenance, Offline pages

Xem chi tiết: [../FRONTEND_PLAN.md](../FRONTEND_PLAN.md)
