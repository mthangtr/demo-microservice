// Định nghĩa các trạng thái của Circuit Breaker
export enum CircuitState {
    CLOSED = 'CLOSED',     // Hoạt động bình thường, cho phép tất cả requests
    OPEN = 'OPEN',         // Ngăn chặn tất cả requests, trả về lỗi ngay lập tức
    HALF_OPEN = 'HALF_OPEN' // Cho phép một số requests thử nghiệm để kiểm tra service
}

// Cấu hình cho Circuit Breaker
export interface CircuitBreakerConfig {
    failureThreshold: number;    // Số lượng lỗi liên tiếp để mở circuit (mặc định: 5)
    successThreshold: number;    // Số lượng success liên tiếp để đóng circuit (mặc định: 3)
    timeout: number;            // Thời gian chờ trước khi thử lại (ms) (mặc định: 60000)
    monitoringPeriod: number;   // Thời gian theo dõi để tính toán failure rate (ms)
}

// Metrics để theo dõi hiệu suất
export interface CircuitBreakerMetrics {
    totalRequests: number;
    successCount: number;
    failureCount: number;
    currentState: CircuitState;
    lastFailureTime?: Date;
    lastSuccessTime?: Date;
}

// Interface chính cho Circuit Breaker
export interface ICircuitBreaker {
    execute<T>(operation: () => Promise<T>): Promise<T>;
    getMetrics(): CircuitBreakerMetrics;
    reset(): void;
}

