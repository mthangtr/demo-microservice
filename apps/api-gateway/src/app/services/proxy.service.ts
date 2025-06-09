import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
    async forward(method: string, url: string, data?: any, headers?: any): Promise<any> {
        const cleanedHeaders = { ...headers };

        delete cleanedHeaders['host'];
        delete cleanedHeaders['content-length'];
        delete cleanedHeaders['connection'];
        delete cleanedHeaders['accept-encoding'];
        delete cleanedHeaders['transfer-encoding'];

        const config: AxiosRequestConfig = {
            method,
            url,
            headers: cleanedHeaders,
            data,
        };

        const response = await axios(config);
        return response.data;
    }
}
