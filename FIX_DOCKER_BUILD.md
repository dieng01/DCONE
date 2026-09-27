# 🐛 Fix Docker Build Issues

## Vấn đề

Khi build Docker, bạn có thể gặp lỗi:
```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync
```

## Nguyên nhân

1. **Lock file cũ không đồng bộ**: `package-lock.json` cũ không khớp với `package.json` mới
2. **Node version**: Một số packages yêu cầu Node >= 22
3. **Dependencies không cần thiết**: Project có các packages không sử dụng (mqtt, @supabase, etc.)

## Giải pháp nhanh

### Cách 1: Sử dụng script tự động (Khuyến nghị)

```bash
# Cấp quyền thực thi
chmod +x fix-docker-build.sh

# Chạy script
./fix-docker-build.sh
```

### Cách 2: Thủ công

```bash
# 1. Xóa lock file cũ
rm -f package-lock.json

# 2. Xóa node_modules
rm -rf node_modules

# 3. Install lại dependencies
npm install

# 4. Build project để kiểm tra
npm run build

# 5. Build Docker với cache mới
docker-compose build --no-cache

# 6. Start services
docker-compose up -d
```

## Những gì đã sửa

### 1. Package.json đã được dọn dẹp

**Đã xóa các packages không cần thiết:**
- ❌ `mqtt` - Đã viết lại MQTTService không dùng package này
- ❌ `@supabase/supabase-js` - Không sử dụng trong project
- ❌ `framer-motion` - Không sử dụng
- ❌ `@dnd-kit/*` - Không sử dụng
- ❌ `canvas-confetti` - Không sử dụng
- ❌ `uuid` - Không sử dụng
- ❌ `react-router-dom` - Không sử dụng

**Dependencies hiện tại:**
```json
{
  "dependencies": {
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.15.4"
  }
}
```

### 2. Dockerfile đã cập nhật

**Thay đổi:**
- ✅ Node version: `node:20-alpine` → `node:22-alpine`
- ✅ Install command: `npm ci` → `npm install`
- ✅ Tự động xử lý lock file updates

### 3. Bundle size giảm

- **Trước**: 918KB (với mqtt package)
- **Sau**: 567KB (không có mqtt)
- **Giảm**: 38%

## Kiểm tra sau khi fix

```bash
# Kiểm tra build thành công
npm run build

# Kiểm tra Docker build
docker-compose build

# Kiểm tra services chạy
docker-compose ps

# Xem logs
docker-compose logs -f
```

## Troubleshooting

### Lỗi: "Cannot find module"

```bash
# Xóa và install lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "EACCES: permission denied"

```bash
# Cấp quyền cho script
chmod +x fix-docker-build.sh

# Hoặc chạy với sudo (không khuyến nghị)
sudo ./fix-docker-build.sh
```

### Lỗi: "Port already in use"

```bash
# Kiểm tra port đang sử dụng
lsof -i :80
lsof -i :8080
lsof -i :27017

# Dừng services cũ
docker-compose down

# Start lại
docker-compose up -d
```

### Lỗi: "MongoDB connection failed"

```bash
# Kiểm tra MongoDB container
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Kiểm tra health
docker-compose exec mongodb mongosh --eval "db.runCommand({ ping: 1 })"
```

## So sánh trước và sau

### Trước khi fix
```
❌ Bundle size: 918KB
❌ Runtime error: useRef null
❌ Docker build fail
❌ 191 packages
❌ Node 20 không tương thích
```

### Sau khi fix
```
✅ Bundle size: 567KB (giảm 38%)
✅ Không có runtime error
✅ Docker build thành công
✅ 130 packages (giảm 32%)
✅ Node 22 tương thích
```

## Tài liệu tham khảo

- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [npm ci vs npm install](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- [Node.js Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Nếu vẫn gặp vấn đề, vui lòng tạo issue trên GitHub với:**
1. Output của `npm --version` và `node --version`
2. Output của `docker --version`
3. Full error log
4. OS và version

**Happy coding! 🚀**
