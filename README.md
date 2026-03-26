# Tổng quan về dự án

- Chào mừng các bạn đến với dự án của team, dự án này là tiền đề, là nền móng cho sự phát triển của team, hướng tới mục tiêu xa hơn là thành lập công ty riêng.
- Sứ mệnh của dự án đối với người học đơn giản nó chỉ là cung cấp nền tảng học tập trực tuyến chất lượng, giúp mọi người tiếp cận kiến thức dễ dàng, linh hoạt và hiệu quả. Sứ mệnh đầy đủ thì sẽ được mô tả cụ thể trong website.
- Sứ mệnh của dự án đối với team Cursed With Knowledge thì nó lớn lao lắm: dự án này là công sức của tất cả mọi thành viên, nó không chỉ gắn kết mọi người lại với nhau mà còn dạy mọi người cách làm việc nhóm sao cho hiệu quả, không phải dồn hết việc cho một người làm nữa vì tất cả đều hướng tới một mục tiêu chung.
- Đội ngũ của chúng tôi: Phương, Văn Dương, Đại Dương, Xa, Trung Anh, Xa, Trang, Ngân, Như, Nam.

## Cách chạy code

- Mở Terminal lên, chọn New Terminal (Hoặc dùng phím tắt Ctrl + Shift + ` trên bàn phím)
- B1: Nhập Yarn
- B2: Nhập Yarn dev

### Gồm các thư mục và file quan trọng sau:

- Mở folder src ra, trong đó có:
- admin: chứa các trang quản trị của admin, chưa có j cả
- assest: nơi lưu ảnh, video, font chữ, audio,.... nma h chưa có j cả
- component: chứa các thành phần nhỏ nhỏ mặc định của web: nút bấm,.....
- default: chứa header và footer
- layout: chứa các thành phần to hơn component cấu tạo nên 1 page con
- pages: các pages con: trang chủ, các khóa học, liên hệ,...
- App.tsx: File quan trọng, chứa các router
- index.css: style chính của toàn bộ dự án
- main.tsx: xương sống của dự án
- index.html: đương nhiên rồi, dự án mà ko có file html thì sao chạy đc
- Còn những cái khác giải thích sau vì nó dài dòng lắm, tạm thời chỉ cần thế thôi

#### Ngôn ngữ của dự án

- Ngôn ngữ: Typescript
- Thư viện Frontend: ReactJs
- Thư viện Backend: NodeJs + Express
- Framework: Tailwind CSS
- Công cụ build: Vite
- Trình quản lý gói (dùng để chạy server): Yarn
- Hệ quản trị CSDL: MySQL Workbench
- Công cụ truy vấn database: Prisma

##### Nền tảng deploy

- Frontend: Vercel
- Backend: Railway
- CSDL: Railway
- Lưu trữ video: Bunny
