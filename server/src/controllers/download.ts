import { DownloadReq, type DownloadModel } from '@/models/download';
import {
  type ElementANode,
  type FileANode,
  type FolderANode,
} from '@/types/abstract_node';
import { RouteError, type IReq, type IRes } from '@/types/types';
import { camelToKebabCase } from '@/util/misc';
import AdmZip from 'adm-zip';
import HttpStatusCodes from 'constants/http_status_codes';
import { useDB } from 'database';
import fs from 'fs';
import logger from 'jet-logger';
import path from 'path';

const admzip = new AdmZip();

class Share {
  protected async insertIntoDB(model: DownloadModel) {
    const keys = Object.keys(model).join(',');
    const values = Object.values(model);
    await useDB(
      `INSERT INTO download (${keys}) VALUES (?,?,?) ON DUPLICATE KEY UPDATE expiration_time = VALUES(expiration_time)`,
      values
    );
  }

  protected compileToVue(data: FileANode) {
    let templateContent = `<template>\n`;
    let scriptContent = `<script setup lang="ts">\n`;
    let styleContent = `<style scoped>\n`;

    scriptContent += this._extractEvents(data.anodes);
    templateContent += this._convertToHtml('', data.anodes);
    styleContent += this._extractStyles(data.anodes);

    templateContent += `\n</template>\n\n`;
    scriptContent += `\n</script>\n\n`;
    styleContent += `\n</style>`;

    return {
      template: templateContent,
      script: scriptContent,
      style: styleContent,
    };
  }

  private _convertToHtml(temp: string, anodes: ElementANode[]): string {
    if (!anodes.length) return '';

    const handleAttrs = (anode: ElementANode): string => {
      let attrs = '';
      anode.attrs.class[anode.key] = true;
      // Process attrs object to create attributes for the tag
      Object.entries(anode.attrs).forEach(([key, value]) => {
        if (key === 'style') return;
        if (typeof value === 'object') {
          value = Object.entries(value)
            .map(([k, v]) => {
              if (key === 'class' && v) {
                return k;
              }
              return v ? `${k}:${v};` : '';
            })
            .join(' ');
        }
        attrs += ` ${camelToKebabCase(key)}="${value}"`;
      });
      return attrs;
    };

    const handleTag = (anode: ElementANode, attrs: string) => {
      // Combine everything into an HTML tag
      let tag = `<${anode.name}${attrs}>`;

      if (anode.textContent) tag += anode.textContent;
      if (anode.children.length)
        tag += this._convertToHtml(tag, anode.children);

      tag += `</${anode.name}>`;
      temp += tag;
    };

    anodes.forEach(anode => {
      const attrs = handleAttrs(anode);
      // Process props and directives if needed

      handleTag(anode, attrs);
    });

    return temp;
  }

  private _extractEvents(anodes: ElementANode[]): string {
    let script = '';

    anodes.forEach(anode => {
      Object.entries(anode.on).forEach(([key, value]: [string, Function]) => {
        const evType = `@${key}`;
        const evValue = `$_${key}Fn`;
        anode.attrs[evType] = evValue;
        script += `const ${evValue} = ${value.toString()};`;
      });
    });

    return script;
  }

  private _extractStyles(anodes: ElementANode[]): string {
    let styles = '';

    anodes.forEach(anode => {
      let cls = `.${anode.key}{`;
      cls += Object.entries(anode.attrs.style)
        .map(([key, value]) => `${camelToKebabCase(key)}: ${value}`)
        .join(';');
      cls += '}';
      styles += cls;
    });

    return styles;
  }

  protected _addHoursToTimestamp(hoursToAdd = 24) {
    const date = new Date(Date.now());
    const newTimestamp = date.getTime() + hoursToAdd * 60 * 60 * 1000;
    return newTimestamp;
  }
}

export class DownloadController extends Share {
  private _resDir = path.resolve(__dirname, '../../public/download');

  constructor() {
    super();
  }

  async createWholeProject(
    req: IReq<DownloadReq<FolderANode>>,
    res: IRes
  ): Promise<IRes> {
    try {
      const { type, node } = req.body;
      const { link } = await this._createOneWhole(node);
      return res.status(HttpStatusCodes.OK).json({ data: link });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '内部错误');
    }
  }

  async createOneFile(
    req: IReq<DownloadReq<FileANode>>,
    res: IRes
  ): Promise<IRes> {
    try {
      const { type, node } = req.body;
      const { link } = await this._createOneFile(node);
      return res.status(HttpStatusCodes.OK).json({ data: link });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '内部错误');
    }
  }

  private _createModel(
    file_key: string,
    filename: string,
    format: 'vue' | 'zip' | 'html'
  ): DownloadModel {
    return {
      file_key,
      link: `/download/${filename}.${format}`,
      expiration_time: 0,
    };
  }

  protected async _createOneWhole(data: FolderANode): Promise<DownloadModel> {
    const filename = `(${data.name})_${data.key}`;
    const filepath = path.join(this._resDir, filename);
    const model = this._createModel(data.key, filename, 'zip');

    const handleFilesCreation = async (
      rootPath: string,
      data: FolderANode['children']
    ) => {
      if (!data.length) return;

      const iterators = (child: any) => {
        if (child.isFolder) {
          const _child = child as FolderANode;
          const subfolderPath = path.join(rootPath, _child.name);
          fs.mkdirSync(subfolderPath);
          handleFilesCreation(subfolderPath, _child.children);
        } else if (child.isFile) {
          const filePath = path.join(rootPath, `${child.name}.vue`);
          const { template, script, style } = this.compileToVue(child);
          fs.writeFileSync(filePath, `${template}${script}${style}`);
        }
      };

      data.forEach(iterators);

      await this._createZipFile(filepath, filename);
    };

    fs.mkdirSync(filepath, { recursive: true });
    await handleFilesCreation(filepath, data.children);
    fs.rmSync(filepath, { recursive: true });

    model.expiration_time = this._addHoursToTimestamp();

    await this.insertIntoDB(model);
    return model;
  }

  protected async _createOneFile(data: FileANode): Promise<DownloadModel> {
    const model = this._createModel(data.key, data.name, 'vue');
    const filePath = path.join(this._resDir, `${data.name}.vue`);
    const { template, script, style } = this.compileToVue(data);

    fs.writeFileSync(filePath, `${template}${script}${style}`);
    model.expiration_time = this._addHoursToTimestamp();
    await this.insertIntoDB(model);

    return model;
  }

  private _createZipFile(sourceDir: string, filename: string) {
    admzip.addLocalFolder(sourceDir, filename);
    return admzip.writeZipPromise(`${sourceDir}.zip`);
  }
}

const controller = new DownloadController();

export default controller;
