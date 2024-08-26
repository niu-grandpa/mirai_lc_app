// tip: AVnode is the abbreviation of abstract node

interface ShareType {
  key: string;
  name: string;
  isLeaf: boolean;
}

interface ObjectMap extends Record<string, string | symbol | number | any> {}

export type TreeDataCommonType = FolderANode | FileANode | ElementANode;

export interface FolderANode extends ShareType {
  isRoot: boolean;
  children: (FolderANode | FileANode)[];
  isFolder: boolean;
  timestamp: number;
}

export interface FileANode extends ShareType {
  isFile: boolean;
  anodes: ElementANode[];
}

export interface ElementANode extends ShareType {
  x: number;
  y: number;
  isComp: boolean;
  textContent: string;
  on: ObjectMap;
  props: ObjectMap;
  directives: ObjectMap;
  children: ElementANode[];
  attrs: ObjectMap & {
    class: Record<string, boolean>;
    style: Record<string, any>;
  };
}

export interface VueFileContent {
  template: string;
  script: string;
  style: string;
}
