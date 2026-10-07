# HNStudio Flow Controller

Ứng dụng desktop điều khiển Google Flow qua Chrome DevTools Protocol (CDP) trên loopback `127.0.0.1`. Mỗi tài khoản dùng một hồ sơ Chrome riêng; cổng bắt đầu từ `9222`, tài khoản tiếp theo dùng cổng kế tiếp nếu cổng đang bận. Cổng debug không lắng nghe trên mạng LAN.

## Chạy trên Windows

Yêu cầu Windows 10/11 x64 và Google Chrome. Mở HNStudio, thêm hồ sơ Flow rồi bấm **Đăng nhập / mở Chrome**. Tool mở Chrome với thư mục hồ sơ riêng và cổng debug cục bộ, sau đó anh đăng nhập Google trực tiếp trong Chrome. Không cần cài hoặc ghép extension.

Tool nhận diện email khi Chrome kết nối nhưng không tự đọc credits nền. Credits chỉ được đọc khi anh bấm **Kiểm tra credit tất cả tài khoản**; mỗi tài khoản Flow được đọc trong lượt đó. Hàng chờ dùng số dư lần đọc gần nhất. Dưới 10 credits, ảnh tự chuyển sang Nano Banana 2 Lite; video tự chuyển sang Omni Flash 360p và rút ngắn thời lượng nếu cần. Video cần ít nhất 4 credits theo mức giá Flow hiện được công bố; nếu thấp hơn, tool giữ tác vụ trong hàng chờ. Giá model có thể đổi theo Flow.

Thêm prompt/ảnh tham chiếu, chọn model rồi đưa vào hàng chờ. Khi bấm **Chạy hàng chờ**, tool tự mở dự án mới nếu chưa có ô prompt, chọn loại ảnh/video và model, điền prompt, tải ảnh rồi bấm **Generate Image** sau khi xác nhận cấu hình. Khi số dư dưới 10, tool chọn model tiết kiệm theo số credits đã đọc. Kết quả cần được kiểm tra và xác nhận trong hàng chờ; tool hiện chưa tự tải file kết quả.

### Ghi thao tác Flow để chẩn đoán

Trong danh sách tài khoản, mở Chrome của tài khoản Flow rồi bấm **Ghi thao tác Flow**. Tự thao tác trên Flow để tạo thử một ảnh và một video, sau đó quay lại tool bấm **Dừng ghi & xuất log**. File JSON ghi nhãn nút, lựa chọn model/tùy chọn và đường dẫn trang; không ghi nội dung prompt hay giá trị ô nhập, mật khẩu hoặc cookie. Gửi file trace để cập nhật các selector tự động hóa theo giao diện Flow đang dùng. Bản ghi này chỉ phục vụ chẩn đoán; chưa tự biến thao tác thành macro chạy lại.

Mỗi tài khoản lưu trạng thái Chrome dưới thư mục dữ liệu ứng dụng. Mật khẩu Google không đi qua HNStudio. Đóng Chrome thì tác vụ mới không được gửi; email và credits lần bấm kiểm tra gần nhất vẫn được lưu. Mở Chrome rồi bấm kiểm tra tất cả trước khi chạy hàng chờ.

## Bảo mật cổng debug

Cổng CDP cấp quyền điều khiển toàn bộ Chrome đang đăng nhập. HNStudio chỉ bind dịch vụ cục bộ trên `127.0.0.1`, mở cổng trong dải `9222–9299` khi chạy, và dùng profile riêng theo tài khoản. Không tự chuyển tiếp các cổng này qua router hoặc mở ra mạng LAN.
