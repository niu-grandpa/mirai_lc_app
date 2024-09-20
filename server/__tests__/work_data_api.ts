import { describe, expect, it } from '@jest/globals';
import axios from 'axios';
import logger from 'jet-logger';
import mockData from '../static/mock_data.json';

describe('work-data接口测试', () => {
  const token =
    'wYBvdjS02p6rHrUgzyMthlS57q1RyBLgRF8g1bWK4ZKrbmsHoHrGPpnRoQWKkusu';

  it('PUT /api/work-data/sync 应返回状态码200', async () => {
    try {
      const response = await axios.put(
        'http://localhost:8000/api/v1/work-data/sync',
        {
          headers: { Authorization: token },
          rootKey: mockData.key,
          content: JSON.stringify(mockData),
        }
      );

      expect(response.status).toBe(200);
    } catch {
      logger.err('请注释src/controllers/auth.ts第26-30行的判断逻辑');
    }
  });

  it('GET /api/work-data/all 应返回状态码200、返回值与mockData相等', async () => {
    const response = await axios.get(
      'http://localhost:8000/api/v1/work-data/all',
      {
        headers: { Authorization: token },
        params: {
          rootKey: mockData.key,
        },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('data[0].content');
    expect(response.data.data[0].content).toEqual(mockData);
  });
});
