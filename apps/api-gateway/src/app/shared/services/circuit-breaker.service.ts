import {Injectable, Logger} from "@nestjs/common";
import {CircuitBreakerConfig, CircuitBreakerMetrics, CircuitState, ICircuitBreaker} from "../interfaces";

@Injectable()
export class CircuitBreakerService implements ICircuitBreaker {
    private readonly logger = new Logger(CircuitBreakerService.name);

    private state: CircuitState = CircuitState.CLOSED;
    private failureCount = 0;
    private successCount = 0;
    private totalRequests = 0;
    private lastFailureTime?: Date;
    private lastSuccessTime?: Date;
    private nextAttempt = 0;

    private readonly config: CircuitBreakerConfig;
    
    constructor(
        private readonly serviceName: string,
        config?: Partial<CircuitBreakerConfig>
    ) {
        this.config = {
            failureThreshold: 5,
            successThreshold: 3,
            timeout: 60000, // 1p
            monitoringPeriod: 60000,
            ...config
        };
        this.logger.log(`Circuit Breaker initialized for ${serviceName} with config:`, this.config);
    }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        // Kiểm tra trạng thái circuit trước khi thực thi
        this.logger.debug(`Circuit breaker checking state for ${this.serviceName}`);
        if (this.state === CircuitState.OPEN) {
            // Nếu open -> chặn all request
            // Kiểm tra xem đã đến thời gian thử lại chưa
            if (Date.now() < this.nextAttempt) {
                this.logger.warn(`Circuit breaker is OPEN for ${this.serviceName}. Request rejected.`);
                throw new Error(`Service ${this.serviceName} is temporarily unavailable (Circuit Breaker OPEN)`);
            }
            // Nếu đến thời gian thử lại -> chuyển sang HALF_OPEN
            // -> để test xem đã request đã hoạt động ổn định hay chưa
            // Chuyển sang HALF_OPEN để thử nghiệm
            this.moveToHalfOpen();
        }

        // Nếu state là CLosed hoặc Half
        // -> cộng số lần request lên
        this.totalRequests++;

        try {
            // chạy lại execute operation
            const result = await operation();
            // nếu thành công
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    getMetrics(): CircuitBreakerMetrics {
        return {
            totalRequests: this.totalRequests,
            successCount: this.successCount,
            failureCount: this.failureCount,
            currentState: this.state,
            lastFailureTime: this.lastFailureTime,
            lastSuccessTime: this.lastSuccessTime
        };
    }

    reset(): void {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.totalRequests = 0;
        this.lastFailureTime = undefined;
        this.lastSuccessTime = undefined;
        this.nextAttempt = 0;

        this.logger.log(`Circuit breaker reset for ${this.serviceName}`);
    }

    /**
     * Xử lý khi operation thành công
     */
    private onSuccess(): void {
        this.successCount++;
        this.lastSuccessTime = new Date();
        // Nếu thành công thì phải kiểm tra state hiện tại có phải là half open không
        if (this.state === CircuitState.HALF_OPEN) {
            // -> nếu half open và thành công thì phải đóng circuit lại
            // successCount = 1 thì có thể là do ăn may
            // nên phải check lớn hơn successThreshold = 3 thì mới coi là service khoẻ lại thật
            // không còn là do ăn may
            if (this.successCount >= this.config.successThreshold) {
                this.logger.log(`Circuit breaker CLOSED for ${this.serviceName}. Success count: ${this.successCount}`);
                this.moveToClosed();
            }
        } else if (this.state === CircuitState.CLOSED) {
            // trong trạng thái closed -> all request hoàn toàn mở
            // và các request thông qua onSuccess nghĩa là thành công
            // -> không tính lần fail cũ nữa nên phải reset lại
            this.failureCount = 0;
            this.logger.log(`Circuit breaker remains CLOSED for ${this.serviceName}. Success count: ${this.successCount}`);
        }
    }

    /**
     * Xử lý khi operation thất bại
     */
    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = new Date();
        // Nếu request đấy fail thì phải kiểm tra xem state đang CLOSED không
        // -> Nếu đang Closed -> cho phép các request qua
        // -> mỗi lần fail thì failureCount tăng
        // -> nếu failureCount lớn hơn failureThreshold cho phép
        // -> chuyển trạng thái sang OPEN -> đóng all request lại
        if (this.state === CircuitState.CLOSED && this.failureCount >= this.config.failureThreshold) {
            this.logger.warn(
                `Circuit breaker OPENED for ${this.serviceName}. Failure count: ${this.failureCount}/${this.config.failureThreshold}`
            );
            this.moveToOpen();
        } else if (this.state === CircuitState.HALF_OPEN) {
            // HALF_OPEN để kiểm tra service
            // Nếu fail trong HALF_OPEN -> nghĩa là service chưa hồi phục
            // quay lại OPEN để đóng all request
            this.logger.warn(
                `Circuit breaker OPENED for ${this.serviceName} during HALF_OPEN. Failure count: ${this.failureCount}/${this.config.failureThreshold}`
            );
            this.moveToOpen();
        }
    }

    /**
     * Chuyển circuit sang trạng thái OPEN (ngăn chặn requests)
     */
    private moveToOpen(): void {
        this.state = CircuitState.OPEN;
        this.nextAttempt = Date.now() + this.config.timeout;
        this.successCount = 0; // Reset success count

        this.logger.warn(
            `Circuit breaker OPENED for ${this.serviceName}. ` +
            `Failure count: ${this.failureCount}/${this.config.failureThreshold}. ` +
            `Next attempt at: ${new Date(this.nextAttempt).toISOString()}`
        );
    }

    /**
     * Chuyển circuit sang trạng thái HALF_OPEN (thử nghiệm)
     */
    private moveToHalfOpen(): void {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0; // Reset để đếm lại

        this.logger.log(`Circuit breaker moved to HALF_OPEN for ${this.serviceName}. Testing service availability.`);
    }

    /**
     * Chuyển circuit về trạng thái CLOSED (hoạt động bình thường)
     */
    private moveToClosed(): void {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;

        this.logger.log(`Circuit breaker CLOSED for ${this.serviceName}. Service is healthy again.`);
    }
}