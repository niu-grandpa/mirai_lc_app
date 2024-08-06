import { FolderANode } from '@/types/abstractNode';
import { nanoid } from 'nanoid';

const _nanoid = () => 'z' + nanoid(8);

export const treeData: FolderANode[] = [
  {
    key: _nanoid() + ';fld',
    name: 'views',
    isLeaf: false,
    isFolder: true,
    timestamp: Date.now(),
    children: [
      {
        isLeaf: true,
        isFile: true,
        key: _nanoid(),
        name: 'Home',
        style: '/* file3 style */',
        script: '/* file3 script */',
        anodes: [
          {
            isLeaf: true,
            key: _nanoid(),
            name: 'div',
            isComp: false,
            x: 10,
            y: 20,
            children: [],
            textContent: 'Example content',
            attrs: {
              class: { aadas: true },
              style: {
                width: '120px',
                height: '60px',
                position: 'absolute',
                color: '#fff',
                fontSize: '16px',
                backgroundColor: '#29e',
              },
            },
            props: {},
            directives: {},
            on: {
              click: () => {
                console.log('clicked!');
              },
            },
          },
          {
            isLeaf: true,
            key: _nanoid(),
            name: 'div',
            isComp: false,
            x: 0,
            y: 0,
            children: [],
            textContent: 'Example content',
            attrs: {
              class: { aadas: true },
              style: {
                width: '120px',
                height: '60px',
                position: 'absolute',
                color: '#fff',
                fontSize: '16px',
                backgroundColor: '#29e',
              },
            },
            props: {},
            directives: {},
            on: {
              click: () => {
                console.log('clicked!');
              },
            },
          },
        ],
      },
    ],
  },
];
