import {Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {ConfigService} from '@nestjs/config';
import {BaseProxyService} from "../shared";

@Injectable()
export class ProductProxyService extends BaseProxyService {
    protected readonly baseUrl: string;
    protected readonly pathPrefix = '/products';

    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService
    ) {
        super(httpService, 'product', {
            failureThreshold: 5,
            successThreshold: 3,
            timeout: 45000,
            monitoringPeriod: 60000
        });

        this.baseUrl = this.configService.get<string>('PRODUCT_SERVICE_URL', 'http://localhost:3002/api');
        this.logger.log(`Product service URL configured as: ${this.baseUrl}`);
    }

}
