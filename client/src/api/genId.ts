import { request } from '.';

export const genANodeId = async (suffix = ''): Promise<string> => {
  const { data: id } = await request<string>({
    method: 'POST',
    url: '/user/gen-anode-id',
    data: { suffix },
  });
  return id;
};
