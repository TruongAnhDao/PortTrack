const readline = require("readline");

async function getCurrentPrice(symbol) {
    try {
        const toDate = Math.floor(Date.now() / 1000);
        // Lùi lại 3 ngày để đảm bảo luôn quét trúng dữ liệu kể cả khi bạn chạy test vào sáng sớm Thứ 2 
        const fromDate = toDate - (3 * 24 * 60 * 60);

        // Chú ý: resolution=1 (Khung thời gian 1 phút để lấy nhịp khớp lệnh gần nhất)
        const url = `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?from=${fromDate}&to=${toDate}&symbol=${symbol}&resolution=1`;

        console.log("Đang gọi:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.t || result.t.length === 0) {
            console.log(`\nKhông tìm thấy dữ liệu cho mã ${symbol}. Vui lòng kiểm tra lại.`);
            return;
        }

        const lastIndex = result.t.length - 1;
        
        // Convert timestamp (giây) sang đối tượng Date của Javascript
        const lastMatchedTime = new Date(result.t[lastIndex] * 1000);
        
        // Tách riêng Giờ:Phút:Giây và Ngày/Tháng/Năm để hiển thị cho đẹp
        const timeStr = lastMatchedTime.toLocaleTimeString('vi-VN');
        const dateStr = lastMatchedTime.toLocaleDateString('vi-VN');

        console.log(`\n--- SNAPSHOT: GIÁ HIỆN TẠI ---`);
        console.log(`Mã cổ phiếu: ${symbol}`);
        console.log(`Giá khớp lệnh gần nhất: ${result.c[lastIndex]} (x1000 VNĐ)`);
        console.log(`Khối lượng khớp tại phút này: ${result.v[lastIndex]}`);
        console.log(`Thời điểm cập nhật API: ${timeStr} ngày ${dateStr}`);
        console.log(`------------------------------\n`);

    } catch (error) {
        console.error("Lỗi quá trình lấy dữ liệu:", error.message);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Nhập mã cổ phiếu muốn kiểm tra ngay lúc này (VD: FPT, VNM): ", async (symbol) => {
    if (!symbol.trim()) {
        console.log("Bạn chưa nhập mã cổ phiếu!");
    } else {
        await getCurrentPrice(symbol.trim().toUpperCase());
    }
    rl.close();
});