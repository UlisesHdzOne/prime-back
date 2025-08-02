import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export const hibpHttpClientFactory = {
  provide: 'HIBP_CLIENT',
  useFactory: (configService: ConfigService): AxiosInstance => {
    return axios.create({
      baseURL: 'https://api.pwnedpasswords.com',
      timeout: 5000,
    });
  },
  inject: [ConfigService],
};
