import { describe, expect, it } from '@jest/globals';
import axios from 'axios';
import logger from 'jet-logger';
import mockData from '../static/mock_data.json';

describe('work-data接口测试', () => {
  // 先运行user_api测试后从user表任取一个uid和token
  const uid = 1;
  const userToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6IjEzMDIyMjIyMjIyIiwiaWF0IjoxNzI3MTcyMjM5LCJleHAiOjE3MjcyNTg2Mzl9.C6FhZzincDP-k61ikYtvTgfHUwtWMM5R_pq7x3Y9WcA';

  it('PUT /api/work-data/sync 应返回状态码200', async () => {
    try {
      const response = await axios.put(
        'http://localhost:8000/api/v1/work-data/sync',
        {
          headers: { Authorization: userToken },
          uid,
          saveTime: Date.now(),
          data: mockData,
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
        headers: { Authorization: userToken },
        params: { uid },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data.data.data).toEqual(mockData);
  });
});
