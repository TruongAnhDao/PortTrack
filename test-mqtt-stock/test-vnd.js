const mqtt = require('mqtt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const MQTT_URL = 'wss://price-streaming-free.vndirect.com.vn/mqtt';

console.log("=== TOOL TEST DỮ LIỆU CHỨNG KHOÁN REALTIME ===");
rl.question('Nhập mã cổ phiếu (VD: FPT, HPG) hoặc gõ # để lấy toàn bộ: ', (inputStr) => {
    
    const symbol = inputStr.trim().toUpperCase() || 'FPT';
    
    // Tạo Topic dựa trên lựa chọn
    const topic = symbol === '#' ? '10/#' : `10/${symbol}`;

    console.log(`\n⏳ Đang kết nối tới máy chủ VNDirect...`);
    
    // Cấu hình kết nối chuẩn để không bị máy chủ từ chối
    const options = {
        clientId: 'vnd_test_' + Math.random().toString(16).substring(2, 8),
        protocolVersion: 4, // Bắt buộc dùng MQTT 3.1.1
        clean: true,
        reconnectPeriod: 3000, // Tự kết nối lại sau 3s nếu rớt mạng
    };

    const client = mqtt.connect(MQTT_URL, options);

    client.on('connect', () => {
        console.log(`✅ Kết nối thành công!`);
        console.log(`📡 Đang Subscribe Topic: ${topic}`);
        
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`🟢 Đang chờ dữ liệu trả về... (Bấm Ctrl + C để thoát)\n`);
                console.log(`--------------------------------------------------`);
            } else {
                console.error(`❌ Lỗi Subscribe:`, err);
            }
        });
    });

    client.on('message', (returnedTopic, message) => {
        try {
            // BƯỚC QUAN TRỌNG: Ép kiểu mảng byte (Binary) thành Text chuẩn UTF-8
            const rawData = message.toString('utf-8');
            
            // In thẳng ra màn hình cùng thời gian thực
            const currentTime = new Date().toLocaleTimeString('vi-VN');
            console.log(`[${currentTime}] ➔ ${rawData}`);
            
        } catch (error) {
            console.log("⚠️ Không thể dịch gói tin này.");
        }
    });

    client.on('error', (err) => {
        console.error('⚠️ Lỗi MQTT:', err);
    });

    // Đóng bộ nhập liệu
    rl.close();
});