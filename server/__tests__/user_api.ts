import { describe, expect, it } from '@jest/globals';
import axios from 'axios';
import logger from 'jet-logger';

describe('user接口测试', () => {
  const phoneNumber = '13022222222';
  const password = 'da1w6d54wafFWf1f613wa4wFw961231hrherWHJe8';

  let userToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidG9rZW4iOm51bGwsInBob25lTnVtYmVyIjoiMTMwMjIyMjIyMjIiLCJwYXNzd29yZCI6ImRhMXc2ZDU0d2FmRldmMWY2MTN3YTR3Rnc5NjEyMzFocmhlcldISmU4Iiwibmlja25hbWUiOiJ0ZXN0LXVzZXIiLCJpc1ZpcCI6MCwiYXZhdGFyIjpudWxsLCJpc0xvZ2luIjowLCJ2aXBFeHBpcmF0aW9uIjpudWxsLCJjcmVhdGVBdCI6IjIwMjQtMDktMjFUMTM6MDE6NTkuMDAwWiIsImlhdCI6MTcyNjkyMzcxOSwiZXhwIjoxNzI3MDEwMTE5fQ.xdJpjc8HnpGyWXgxSU4risYFm3XSkT72fezI0a5tv98';

  it('POST /api/user/register -> 应返回token', async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/user/register',
        {
          phoneNumber,
          password,
          code: '123456',
          nickname: 'test-user',
        }
      );
      userToken = response.data.data;
      expect(response.status).toBe(200);
      expect(typeof userToken).toBe('string');
    } catch (error) {
      logger.err(
        '[src/controllers/user.ts] 测试时请注释该行代码: password = this.encrypt(this.parse(password))'
      );
      expect(error.status).toBe(400);
      expect(error.response.data.data).toEqual('该手机号已被注册');
    }
  });

  it('GET /api/user/login -> 使用token登录', async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/v1/user/login',
        {
          headers: { Authorization: userToken },
        }
      );
      expect(response.status).toBe(200);
      expect(typeof response.data.data).toBe('string');
    } catch (error) {
      expect(error.status).toBe(400);
      expect(error.response.data.data).toEqual('禁止重复登录');
    }
  });

  it('POST /api/user/logout -> 退出登录', async () => {
    const response = await axios.post(
      'http://localhost:8000/api/v1/user/logout',
      {
        headers: { Authorization: userToken },
      }
    );
    expect(response.status).toBe(200);
  });

  it('DELETE /api/user/destroy -> 注销用户', async () => {
    const response = await axios.delete(
      'http://localhost:8000/api/v1/user/destroy',
      {
        headers: { Authorization: userToken },
        params: { phoneNumber },
      }
    );
    expect(response.status).toBe(200);
  });

  it('POST /api/user/gen-anode-id -> 生成节点key', async () => {
    const response = await axios.post(
      'http://localhost:8000/api/v1/user/gen-anode-id',
      {
        headers: { Authorization: userToken },
        suffix: '',
      }
    );
    expect(response.status).toBe(200);
    expect(typeof response.data.data).toBe('string');
  });
});
