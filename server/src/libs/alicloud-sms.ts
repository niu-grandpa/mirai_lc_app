import * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import Dysmsapi20170525, {
  SendSmsResponseBody,
} from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';

export default async function sendSmsByAlicloud(
  phoneNumbers: string,
  code: string
): Promise<SendSmsResponseBody> {
  const client = createClient();
  const runtime = new $Util.RuntimeOptions({});
  const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
    signName: 'MgChat',
    templateCode: 'SMS_461395552',
    phoneNumbers,
    templateParam: `{"code":"${code}"}`,
  });

  try {
    const { body } = await client.sendSmsWithOptions(sendSmsRequest, runtime);
    return body!;
  } catch (error) {
    console.log(error.data['Recommend']);
    throw error.message;
  }
}

/**
 * @remarks
 * 使用AK&SK初始化账号Client
 * @returns Client
 *
 * @throws Exception
 */
function createClient(): Dysmsapi20170525 {
  const config = new $OpenApi.Config({
    accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
  });
  // Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
  config.endpoint = `dysmsapi.aliyuncs.com`;
  return new Dysmsapi20170525(config);
}
