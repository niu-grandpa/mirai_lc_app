import { describe } from '@jest/globals';
import test from 'node:test';
import { DownloadController } from '../src/controllers/download';
import { type FileANode, type FolderANode } from '../src/types/abstract_node';

describe('DownloadController 测试用例', () => {
  class DownloadControllerTest extends DownloadController {
    constructor() {
      super();
    }
    testCreateWholeProject(data: FolderANode) {
      return this._createOneWhole(data);
    }
    testCreateOneFile(data: FileANode) {
      return this._createOneFile(data);
    }
  }

  const controller = new DownloadControllerTest();

  test('生成项目zip包', async () => {
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
      await controller.testCreateWholeProject(mock);
    } catch {}
  });

  test('生成单个vue文件', async () => {
    const mock = {
      isLeaf: true,
      isFile: true,
      key: 'zHwf2eg2L',
      name: 'Login',
      anodes: [
        {
          isLeaf: true,
          key: 'zAg_e6Heh',
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
    };

    try {
      await controller.testCreateOneFile(mock);
    } catch {}
  });
});
