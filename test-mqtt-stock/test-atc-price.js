const readline = require("readline");

async function getATCPrice(symbol) {
    try {
        const toDate = Math.floor(Date.now() / 1000);
        const fromDate = toDate - (7 * 24 * 60 * 60);

        // Đổi sang API của DNSE - Trả về dữ liệu mảng (arrays) chuyên dụng cho biểu đồ
        const url = `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?from=${fromDate}&to=${toDate}&symbol=${symbol}&resolution=1D`;

        console.log("Đang gọi:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        // Cấu trúc JSON của DNSE: { t: [thời gian], c: [giá đóng], o: [giá mở], v: [khối lượng], ... }
        if (!result.t || result.t.length === 0) {
            console.log(`\nKhông tìm thấy dữ liệu cho mã ${symbol}. Vui lòng kiểm tra lại.`);
            return;
        }

        // Lấy index cuối cùng của mảng (tương ứng với phiên giao dịch gần nhất)
        const lastIndex = result.t.length - 1;
        
        // Chuyển đổi timestamp của DNSE (giây) sang ngày tháng dễ đọc
        const tradeDate = new Date(result.t[lastIndex] * 1000).toLocaleDateString('vi-VN');

        console.log(`\n--- KẾT QUẢ CHO ${symbol} ---`);
        console.log(`Giá đóng cửa (ATC): ${result.c[lastIndex]} (x1000 VNĐ)`);
        console.log(`Giá mở cửa: ${result.o[lastIndex]}`);
        console.log(`Khối lượng giao dịch: ${result.v[lastIndex]}`);
        console.log(`Ngày giao dịch: ${tradeDate}`);
        console.log(`-------------------------\n`);

    } catch (error) {
        console.error("Lỗi quá trình lấy dữ liệu:", error.message);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Nhập mã cổ phiếu (VD: FPT, SSI): ", async (symbol) => {
    if (!symbol.trim()) {
        console.log("Bạn chưa nhập mã cổ phiếu!");
    } else {
        await getATCPrice(symbol.trim().toUpperCase());
    }
    rl.close();
});