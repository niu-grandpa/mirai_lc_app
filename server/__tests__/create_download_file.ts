import { describe } from '@jest/globals';
import test from 'node:test';
import controller from '../src/controllers/download';
import { type FolderANode } from '../src/types/abstract_node';

describe('测试 DownloadController.create', () => {
  test('应创建一个包含 .vue 的项目zip包', async () => {
    const mock: FolderANode = {
      key: 'zYYfHhDg-;fld',
      name: 'views',
      isLeaf: false,
      isFolder: true,
      children: [
        {
          isLeaf: true,
          isFile: true,
          key: 'zV3w9KhJM',
          name: 'Home',

          anodes: [
            {
              isLeaf: true,
              key: 'zFy_v0ROE',
              name: 'div',
              isComp: false,
              x: 10,
              y: 20,
              children: [],
              textContent: 'Example content',
              attrs: {
                class: {
                  aadas: true,
                },
                style: {
                  width: '120px',
                  height: '60px',
                  position: 'absolute',
                  transform: 'translate(10px, 20px)',
                  color: '#fff',
                  fontSize: '16px',
                  backgroundColor: '#29e',
                },
              },
              props: {},
              directives: {},
              on: {
                click: () => {
                  const num = 1;
                  console.log(num);
                },
              },
            },
            {
              isLeaf: true,
              key: 'zm_op2jmq',
              name: 'div',
              isComp: false,
              x: 0,
              y: 0,
              children: [],
              textContent: 'Example content2',
              attrs: {
                class: {
                  aadas: true,
                },
                style: {
                  width: '120px',
                  height: '60px',
                  position: 'absolute',
                  transform: 'translate(0, 0)',
                  color: '#fff',
                  fontSize: '16px',
                  backgroundColor: '#29e',
                },
              },
              props: {},
              directives: {},
              on: {},
            },
          ],
        },
      ],
    };

    try {
      const res = await controller._testCreateFn(mock);
      console.log('result: ', res);
    } catch {}
  });
});
