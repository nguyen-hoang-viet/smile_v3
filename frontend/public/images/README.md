# Hướng dẫn thêm QR Code thanh toán

## Cách thêm hình ảnh QR thanh toán:

1. **Lưu hình ảnh QR của bạn** với tên `qr-payment.png` vào thư mục này
2. **Định dạng được hỗ trợ**: PNG, JPG, JPEG
3. **Kích thước khuyến nghị**: 200x200 pixel trở lên (sẽ được tự động resize xuống 60x60px trên bill)
4. **Chất lượng**: Đảm bảo QR code rõ nét để dễ quét

## Thay đổi tên file (nếu cần):

Nếu bạn muốn sử dụng tên file khác, hãy sửa trong file:
`frontend/src/components/BillPrint.tsx`

Tìm dòng:
```tsx
src="/images/qr-payment.png"
```

Đổi thành tên file của bạn:
```tsx
src="/images/ten-file-cua-ban.png"
```

## Các loại QR có thể sử dụng:

- QR thanh toán ngân hàng (VietQR)
- QR Momo, ZaloPay, ShopeePay
- QR thông tin liên hệ
- QR link website/fanpage

## Lưu ý:

- File phải được đặt trong thư mục `frontend/public/images/`
- Đường dẫn trong code là `/images/` (không có `public`)
- Nếu không có file QR, hình sẽ tự động ẩn đi
