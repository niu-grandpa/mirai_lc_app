import { describe, expect, it } from '@jest/globals';
import axios from 'axios';

describe('user接口测试', () => {
  const phoneNumber = '13022222222';
  const password = '123456';

  let uid = 0;
  let userToken = '';

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

      expect(response.status).toBe(200);
      expect(typeof response.data.data).toBe('object');

      uid = response.data.data.id;
      userToken = response.data.data.token;
    } catch (error) {
      if (error.status === 400) {
        // 运行第二次测试时，需要手动从user表中选一个用户的uid和token
        uid = 1;
        userToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6IjEzMDIyMjIyMjIyIiwiaWF0IjoxNzI3MTcyMjM5LCJleHAiOjE3MjcyNTg2Mzl9.C6FhZzincDP-k61ikYtvTgfHUwtWMM5R_pq7x3Y9WcA';
      }
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

  // it('DELETE /api/user/destroy -> 注销用户', async () => {
  //   const response = await axios.delete(
  //     'http://localhost:8000/api/v1/user/destroy',
  //     {
  //       headers: { Authorization: userToken },
  //       params: { uid, phoneNumber },
  //     }
  //   );
  //   expect(response.status).toBe(200);
  // });

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
