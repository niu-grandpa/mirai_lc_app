import { describe, it } from '@jest/globals';
import exportWorkData from '../src/controllers/work_data/share/export';
import mockData from '../static/mock_data.json';

describe('exportWorkData函数文件导出测试', () => {
  const exportFun = exportWorkData(mockData[0]);

  it('调用toJson -> 生成json文件', async () => {
    await exportFun.toJson();
  });

  it('调用toVue -> 生成单个vue文件&包含模板项目的zip包', async () => {
    await exportFun.toVue();
    await exportFun.toVue(true);
  });
});
