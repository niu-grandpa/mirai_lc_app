export function getWinHeight() {
  return (
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight
  );
}

/**
 * localStorage getItem plus
 */
export function getLocalItem<T>(key: string): T {
  const d = localStorage.getItem(key);
  const val = JSON.parse(d ?? '""');
  return val;
}

/**
 * localStorage setItem plus
 */
export function setLocalItem(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function deepClone<T>(o: T): T {
  if (typeof o !== 'object' || o === null) {
    return o;
  }

  let result: any = Array.isArray(o) ? [] : {};
  let loopList: Array<{ parent: any; key: string | undefined; data: any }> = [
    {
      parent: result,
      key: undefined,
      data: o,
    },
  ];

  while (loopList.length) {
    let node = loopList.pop()!;
    let { parent, key, data } = node;

    let container = parent;
    if (typeof key !== 'undefined') {
      container = parent[key] = Array.isArray(data) ? [] : {};
    }

    if (data && typeof data === 'object') {
      for (let k in data) {
        if (data.hasOwnProperty(k)) {
          if (typeof data[k] === 'object' && data[k] !== null) {
            loopList.push({
              parent: container,
              key: k,
              data: data[k],
            });
          } else {
            container[k] = data[k];
          }
        }
      }
    }
  }

  return result;
}

export function extractNumberFromString(input: string): number {
  const result = input.match(/-?\d+(\.\d+)?/);
  return result ? parseFloat(result[0]) : 0;
}
