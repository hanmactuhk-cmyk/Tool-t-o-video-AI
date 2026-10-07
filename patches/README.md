# HNStudio Flow Controller

Ứng dụng desktop điều khiển Google Flow qua Chrome DevTools Protocol (CDP) trên loopback `127.0.0.1`. Mỗi tài khoản dùng một hồ sơ Chrome riêng; cổng bắt đầu từ `9222`, tài khoản tiếp theo dùng cổng kế tiếp nếu cổng đang bận. Cổng debug không lắng nghe trên mạng LAN.

## Chạy trên Windows

Yêu cầu Windows 10/11 x64 và Google Chrome. Mở HNStudio, thêm hồ sơ Flow rồi bấm **Đăng nhập / mở Chrome**. Tool mở Chrome với thư mục hồ sơ riêng và cổng debug cục bộ, sau đó anh đăng nhập Google trực tiếp trong Chrome. Không cần cài hoặc ghép extension.

Tool nhận diện email và credit từ trang Flow, lưu lần đọc gần nhất, và chỉ giao việc khi số dư đã được đọc, còn dương, cùng ngân sách dự kiến đủ. Nếu Flow đổi giao diện hoặc một bộ chọn không nhận diện được, tác vụ dừng và ghi log.

Thêm prompt/ảnh tham chiếu, chọn model và đưa vào hàng chờ. Tool dùng CDP để chọn cấu hình, điền prompt và tải ảnh tham chiếu. Tự bấm Tạo chỉ chạy khi model và cấu hình được xác minh. Kết quả hiện cần tải từ Flow và gắn vào hàng chờ để xác nhận; tool chưa tự tải kết quả đầu ra.

Mỗi tài khoản lưu trạng thái Chrome dưới thư mục dữ liệu ứng dụng. Mật khẩu Google không đi qua HNStudio. Đóng Chrome thì tác vụ mới không được gửi; email và credit lần đọc gần nhất vẫn được lưu.

## Bảo mật cổng debug

Cổng CDP cấp quyền điều khiển toàn bộ Chrome đang đăng nhập. HNStudio chỉ bind dịch vụ cục bộ trên `127.0.0.1`, mở cổng trong dải `9222–9299` khi chạy, và dùng profile riêng theo tài khoản. Không tự chuyển tiếp các cổng này qua router hoặc mở ra mạng LAN.
