import { describe, expect, it } from '@jest/globals';
import axios from 'axios';
import logger from 'jet-logger';
import mockData from '../static/mock_data.json';

describe('work-data接口', () => {
  // 先运行user_api测试后从user表任取一个account和token
  const account = 1003640871;
  const userToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6IjE1MzAyNTQxMzk2IiwiYWNjb3VudCI6IjEwMDM2NDA4NzEiLCJpYXQiOjE3Mjg3MzYzMDMsImV4cCI6MTcyODgyMjcwM30.4uOSYLjwIgHQTrGp0d3xUx3diXfLUfbooTBkRFYjovI';

  it('PUT /api/work-data/sync 应返回状态码200', async () => {
    try {
      const response = await axios.put(
        'http://localhost:8000/api/v1/work-data/sync',
        {
          headers: { Authorization: userToken },
          account,
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
        params: { account },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data.data.data).toEqual(mockData);
  });

  it('POST /api/work-data/create-folder', async () => {
    const response = await axios.post(
      'http://localhost:8000/api/v1/work-data/create-folder',
      {
        name: 'A',
        isRoot: true,
      }
    );
    expect(response.status).toBe(200);
  });

  it('POST /api/work-data/create-file', async () => {
    const response = await axios.post(
      'http://localhost:8000/api/v1/work-data/create-file',
      {
        name: 'A-a',
      }
    );
    expect(response.status).toBe(200);
  });

  it('POST /api/work-data/create-component', async () => {
    const response = await axios.post(
      'http://localhost:8000/api/v1/work-data/create-component',
      {
        tagName: 'div',
        x: 0,
        y: 0,
        textContent: 'some content...',
        attributes: {
          class: 'box',
        },
        eventBinding: {
          click: {
            fn: (() => {}).toString(),
          },
          touch: {},
        },
      }
    );
    expect(response.status).toBe(200);
  });

  it('POST /api/work-data/export', async () => {
    const response = await axios.post(
      'http://localhost:8000/api/v1/work-data/export',
      {
        fileType: 'json',
        data: mockData[0],
      }
    );
    const response2 = await axios.post(
      'http://localhost:8000/api/v1/work-data/export',
      {
        fileType: 'vue',
        data: mockData[0].children[0].children[0],
      }
    );
    const response3 = await axios.post(
      'http://localhost:8000/api/v1/work-data/export',
      {
        fileType: 'vue',
        data: mockData[0],
      }
    );
    expect(response.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response3.status).toBe(200);
  });
});
