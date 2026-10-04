# BÁO CÁO BÀI 4: MÔ PHỎNG QUY TRÌNH HOTFIX & GITFLOW THỰC TẾ

**Họ và tên học viên:** Nguyễn Phúc  
**Email:** phuchb24@gmail.com  
**Đường dẫn nộp bài trên GitHub:** `homework/session_05/ex4/`

---

## 1. Mục tiêu bài thực hành

- Thấu hiểu và áp dụng **mô hình phân nhánh Gitflow** (Gitflow Branching Model) chuẩn trong quản lý vòng đời phần mềm.
- Thực hành tạo, kiểm thử và tích hợp nhánh **Hotfix** khẩn cấp trực tiếp vào hệ thống đang chạy (`main`).
- **Đồng bộ hóa bản vá nóng (Hotfix)** ngược lại nhánh phát triển (`develop`) để tránh hiện tượng trôi lỗi (bug regression) ở các phiên bản tương lai.
- Gắn nhãn phiên bản (**Git Tag**) để quản lý các bản phát hành chuẩn chỉnh.

---

## 2. Bối cảnh & Ràng buộc bài toán

- **Nhánh `main`**: Đang chạy mã nguồn Production ổn định (Phiên bản **v1.0.0**). Đột xuất phát hiện lỗi bảo mật nghiêm trọng (lộ mật khẩu trong log hệ thống tại endpoint `/api/user/profile`).
- **Nhánh `develop`**: Đang phát triển dở dang các tính năng mới cho phiên bản tương lai (v1.1.0) và **không thể deploy ngay được**.
- **Yêu cầu bắt buộc**:
  1. Tạo nhánh `hotfix/v1.0.1` tách trực tiếp từ `main`.
  2. Sửa lỗi bảo mật trên `hotfix/v1.0.1`.
  3. Gộp `hotfix/v1.0.1` vào `main` và gắn tag `v1.0.1`.
  4. Gộp `hotfix/v1.0.1` ngược lại vào `develop`.
  5. Xóa nhánh `hotfix/v1.0.1` cục bộ sau khi hoàn thành để dọn dẹp.

---

## 3. Sơ đồ phân nhánh Gitflow Hotfix (ASCII Diagram)

```text
main       ---(v1.0.0)------------------------*---------(v1.0.1)------->
               \                             / \
                \                           /   \ (Merge hotfix into main)
                 \                         /     \
hotfix/v1.0.1     \                       *-------|-------------------->
                   \                     / (Fix)  | (Merge hotfix into develop)
                    \                   /         v
develop              *--------*-------------------*-------------------->
                    (Init)  (WIP v1.1.0)        (Merge conflict resolved)
```

---

## 4. Chi tiết các bước thực hiện

### Bước 1: Khởi tạo phiên bản Production (v1.0.0) trên `main`

Tạo file `server.js` có chứa lỗi lộ thông tin bảo mật và commit lên `main`:

```bash
git checkout main
# Commit code production v1.0.0
git add homework/session_05/ex4/server.js
git commit -m "feat(prod): release production version v1.0.0"

# Gắn tag v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0 stable production"
```

---

### Bước 2: Khởi tạo nhánh `develop` và phát triển tính năng tương lai

Tách nhánh `develop` từ `main` và thêm tính năng mới dở dang (v1.1.0-dev):

```bash
git checkout -b develop

# Thêm endpoint /api/analytics (WIP)
git add homework/session_05/ex4/server.js
git commit -m "feat(develop): add analytics endpoint for v1.1.0 release (WIP)"
```

---

### Bước 3: Tạo nhánh Hotfix khẩn cấp từ `main`

Khi sự cố lộ log xảy ra trên production, lập tức chuyển về `main` và tách nhánh `hotfix/v1.0.1`:

```bash
git checkout main
git checkout -b hotfix/v1.0.1
```

Sửa lỗi bảo mật trong `server.js` (loại bỏ việc ghi log password):

```javascript
// SECURITY FIX: Remove password from debug log to prevent data leak
app.get('/api/user/profile', (req, res) => {
    const { username } = req.query;
    console.log(`[SECURITY SECURE] User auth request - User: ${username}`);
    res.json({ status: "success", user: username });
});
```

Commit bản vá lỗi:

```bash
git add homework/session_05/ex4/server.js
git commit -m "fix(security): sanitize debug logs to prevent password data leak"
```

---

### Bước 4: Gộp Hotfix vào `main` và đánh Tag phiên bản `v1.0.1`

```bash
git checkout main
git merge --no-ff hotfix/v1.0.1 -m "merge: hotfix v1.0.1 into main"

# Đánh tag v1.0.1
git tag -a v1.0.1 -m "Release Hotfix 1.0.1 - Fix sensitive data leak"
```

---

### Bước 5: Gộp ngược Hotfix vào nhánh `develop` (Đồng bộ hóa bản vá)

Đưa bản vá nóng từ `hotfix/v1.0.1` về `develop` để code tương lai không bị tái phát lỗi:

```bash
git checkout develop
git merge --no-ff hotfix/v1.0.1 -m "merge: hotfix v1.0.1 into develop"
```

*(Giải quyết xung đột nếu có, giữ cả fix bảo mật và tính năng mới trên develop)*

```bash
git add homework/session_05/ex4/server.js
git commit -m "merge: resolve conflict and integrate hotfix v1.0.1 into develop"
```

---

### Bước 6: Xóa nhánh Hotfix cục bộ để dọn dẹp

```bash
git branch -d hotfix/v1.0.1
```

---

## 5. Kết quả kiểm tra hệ thống

### Lệnh 1: Kiểm tra danh sách nhánh và Tag

```bash
git branch -a
git tag
```

#### Kết quả trả về:

```text
  develop
  feature-api
  feature/authentication
* main
  master

v1.0.0
v1.0.1
```

> ✅ Nhánh `hotfix/v1.0.1` đã được xóa dọn dẹp thành công.  
> ✅ Đã xuất hiện tag **`v1.0.1`** trên nhánh `main`.

---

### Lệnh 2: Kiểm tra sơ đồ lịch sử gộp nhánh (`git log --graph --oneline --all`)

```text
*   7937fb4 (develop) merge: resolve conflict and integrate hotfix v1.0.1 into develop
|\  
* | 2bc9e33 feat(develop): add analytics endpoint for v1.1.0 release (WIP)
| | *   7d7791d (HEAD -> main, tag: v1.0.1, master) merge: hotfix v1.0.1 into main
| | /| 
| |/ | 
| *  | 100e66e fix(security): sanitize debug logs to prevent password data leak
| / /  
|/ /   
* / 71fe458 (tag: v1.0.0) feat(prod): release production version v1.0.0
```

#### Nhận xét kết quả:
1. **Tag `v1.0.1`** trỏ đúng vào commit merge hotfix trên nhánh `main`.
2. **Nhánh `develop`** đã chứa commit sửa lỗi `100e66e` từ hotfix, giúp các phiên bản tương lai thừa hưởng bản vá bảo mật.
3. **Nhánh `hotfix/v1.0.1`** đã hoàn thành sứ mệnh và được xóa dọn dẹp.

---

## 6. Tổng kết bài học & Quy tắc Gitflow

| Nhánh | Mục đích sử dụng | Quy tắc gộp nhánh |
|---|---|---|
| `main` | Chứa code Production đang chạy ổn định | Chỉ gộp từ `release/` hoặc `hotfix/` kèm Tag |
| `develop` | Chứa code đang phát triển cho phiên bản tiếp theo | Gộp tính năng từ `feature/` và bản vá từ `hotfix/` |
| `hotfix/*` | Sửa lỗi khẩn cấp trên Production | Tách từ `main`, bắt buộc gộp cả vào `main` và `develop` |

### Bài học kinh nghiệm:
- **Luôn gộp ngược Hotfix vào `develop`**: Nếu quên bước này, khi release phiên bản v1.1.0 từ `develop`, lỗi lộ log bảo mật sẽ bị tái phát (regression bug).
- **Sử dụng `--no-ff` (No Fast-Forward)** khi merge hotfix để duy trì lịch sử nhánh rõ ràng trong Git graph.
