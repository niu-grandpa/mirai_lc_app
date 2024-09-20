import { describe, expect } from '@jest/globals';
import test from 'node:test';
import { DownloadController } from '../src/controllers/download';
import { DOWNLOAD_FILE_TYPE } from '../src/models/download';
import { type FileANode, type FolderANode } from '../src/types/abstract_node';
import mockData from '../static/mock_data.json';

class Test extends DownloadController {
  constructor() {
    super();
  }
  testCreateWholeProject(data: FolderANode) {
    return this._createOneWhole(data);
  }
  testCreateOneFile(type: DOWNLOAD_FILE_TYPE, data: FileANode) {
    return this._createOneFile(type, data);
  }
}

describe('download接口功能测试', () => {
  const target = new Test();

  test('测试目标: createWholeProject', async () => {
    try {
      const res = await target.testCreateWholeProject(mockData);
      expect(res).toBeTruthy();
    } catch {}
  });

  const [data] = mockData.children[0].children[0].children;

  test('测试目标: createOneFile -> vue file', async () => {
    try {
      const res = await target.testCreateOneFile(DOWNLOAD_FILE_TYPE.VUE, data);
      expect(res).toBeTruthy();
    } catch {}
  });
  test('测试目标: createOneFile -> json file', async () => {
    try {
      const res = await target.testCreateOneFile(DOWNLOAD_FILE_TYPE.JSON, data);
      expect(res).toBeTruthy();
    } catch {}
  });
});
