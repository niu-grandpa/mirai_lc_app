import { FileContentNode, FileNode } from '../tree_data/types';

// Vue 和 React 的字符串代码需要手动编译为文件
// HTML 则转换成对应的 vnodes 再调用各自的编译函数

const selfClosingTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

export const compileToVue = (file: FileNode): string => {
  let styleContent = '';
  let scriptContent = '';

  // 编译单个节点
  const compileNode = (node: FileContentNode): string => {
    const { tagName, key, attributes, eventBinding, textContent, children } =
      node;

    const compiledAttributes = compileAttributes(attributes, key);
    const compiledEvents = compileEvents(eventBinding, key);

    if (selfClosingTags.has(tagName)) {
      return `<${tagName} id="${key}" ${compiledAttributes} ${compiledEvents} />`;
    }

    const compiledChildren = children.map(compileNode).join('\n');

    return `
<${tagName} id="${key}" ${compiledAttributes} ${compiledEvents}>
    ${textContent}${compiledChildren}
  </${tagName}>`.trim();
  };

  // 编译节点的 attributes
  const compileAttributes = (
    attributes: { [key: string]: any },
    nodeId: string
  ): string => {
    return Object.entries(attributes)
      .map(([attrKey, value]) => {
        if (attrKey === 'style') {
          return handleStyle(value, nodeId); // 处理 style
        } else if (attrKey === 'class') {
          return handleClass(value); // 处理 class
        }
        return `${attrKey}="${value}"`; // 处理普通属性
      })
      .filter(Boolean)
      .join(' ');
  };

  // 处理 style 属性，合并到 styleContent 中，并按需换行和缩进
  const handleStyle = (
    styleObj: { [key: string]: string },
    nodeId: string
  ): string => {
    const styleString = Object.entries(styleObj)
      .map(([prop, val]) => `  ${prop}: ${val};`) // 为每个属性增加缩进
      .join('\n'); // 换行处理
    styleContent += `#${nodeId} {\n${styleString}\n}\n`; // 样式块结构调整
    return '';
  };

  // 处理 class 属性，过滤布尔值为 false 的 class
  const handleClass = (classObj: { [key: string]: boolean }): string => {
    const classString = Object.keys(classObj)
      .filter(className => classObj[className])
      .join(' ');
    return classString ? `class="${classString}"` : '';
  };

  // 编译事件绑定
  const compileEvents = (
    eventBinding: { [key: string]: { [key: string]: string } },
    nodeId: string
  ): string => {
    return Object.entries(eventBinding)
      .map(([event, handlers]) => {
        return Object.entries(handlers)
          .map(([handlerName, handlerBody]) => {
            scriptContent += `const ${handlerName} = ${handlerBody};\n`;
            return `@${event}="${handlerName}"`;
          })
          .join(' ');
      })
      .join(' ');
  };

  // 编译所有节点
  const compiledTemplate = file.content.map(compileNode).join('\n');

  return `
<template>
  ${compiledTemplate}
</template>

<script setup lang="ts">
${scriptContent.trim()}
</script>

<style>
${styleContent.trim()}
</style>
`.trim();
};

export const compileToReact = (file: FileNode) => {
  return '';
};

export const compileToHtml = () => {};
