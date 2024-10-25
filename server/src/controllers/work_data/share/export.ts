import AdmZip from 'adm-zip';
import { copy, mkdir, rm, writeFile, writeJson } from 'fs-extra';
import path from 'path';
import { FileNode, FolderChildren, FolderNode } from '../tree_data/types';
import { compileToReact, compileToVue } from './compile';

type FileSuffix = '.vue' | '.tsx';

export type FileExportType = 'vue' | 'react' | 'json' | 'html';

export default function exportWorkData(data: FolderChildren) {
  const zip = new AdmZip();

  const downloadPath = '../../../../public/download';
  const baseName = `${data.name}_${data.rootKey.replace(';fld', '')}`;
  const outputPath = path.join(__dirname, downloadPath, baseName);
  const returnVal = `/download/${baseName}`;

  const createFile = async (path: string, content: string) => {
    await writeFile(path, content, 'utf8');
  };

  const createDirectory = async (
    node: FolderNode,
    basePath: string = outputPath
  ) => {
    await mkdir(basePath, { recursive: true });

    const directoryPromises = (node.children as FolderNode[])
      .filter(child => child.isFolder)
      .map(async folderNode => {
        const subDirectoryPath = path.join(basePath, folderNode.name);
        await createDirectory(folderNode, subDirectoryPath);
      });

    await Promise.all(directoryPromises);
  };

  const createFilesAndInsertIntoDirectory = async (
    node: FolderNode,
    fileSuffix: FileSuffix,
    basePath: string = outputPath
  ) => {
    const currentNode = node as FolderNode & FileNode;

    if (currentNode.isFile) {
      // 根据后缀生成相应的文件内容
      const fileContent = compileFileNode(currentNode, fileSuffix);
      const filePath = path.join(basePath, currentNode.name) + fileSuffix;
      await createFile(filePath, fileContent);
    } else if (currentNode.isFolder) {
      // 处理文件在对应的文件夹路径下递归创建
      const folderPath = path.join(
        basePath,
        !currentNode.isRoot ? currentNode.name : ''
      );
      const filePromises = (currentNode.children as FolderNode[]).map(
        async child => {
          await createFilesAndInsertIntoDirectory(
            child,
            fileSuffix,
            folderPath
          );
        }
      );

      // 等待所有文件和子文件夹的创建完成
      await Promise.all(filePromises);
    }
  };

  // 编译文件节点
  const compileFileNode = (file: FileNode, suffix: FileSuffix): string => {
    switch (suffix) {
      case '.vue':
        return compileToVue(file);
      case '.tsx':
        return compileToReact(file);
      default:
        return '';
    }
  };

  const getTemplatePath = (type: FileExportType) => {
    const templatePath = '../../../../static/template';
    return path.join(__dirname, templatePath, `${type}-project`);
  };

  const createZipPackage = async (fileSuffix: FileSuffix) => {
    // 创建文件夹并生成文件
    await createDirectory(data as FolderNode);
    await createFilesAndInsertIntoDirectory(data as FolderNode, fileSuffix);

    // 添加模板文件
    const fileType = fileSuffix === '.tsx' ? 'react' : 'vue';
    await copy(getTemplatePath(fileType), outputPath, {
      overwrite: true,
      errorOnExist: false,
    });

    // 将输出文件夹添加到 zip 中
    const folderInZip = baseName.split('_')[0];
    zip.addLocalFolder(outputPath, folderInZip);

    // 写入 zip 文件
    const zipFilePath = `${outputPath}.zip`;
    zip.writeZip(zipFilePath);

    // 移除源文件夹
    rm(outputPath, { recursive: true });
  };

  return {
    async toJson(): Promise<string> {
      await writeJson(outputPath + '.json', data, { spaces: 1 });
      return `${returnVal}.json`;
    },

    async toVue(_package?: boolean): Promise<string> {
      if (_package) {
        await createZipPackage('.vue');
        return `${returnVal}.vue`;
      } else {
        await createFile(
          outputPath + '.vue',
          // @ts-ignore
          compileToVue(data.children[0].children[0])
        );
        return `${returnVal}.zip`;
      }
    },
  };
}
