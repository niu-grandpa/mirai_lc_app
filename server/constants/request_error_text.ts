enum RequestErrText {
  OK = '操作成功',
  NOT_LOGGED_IN = '用户未登录',
  LOGIN_EXPIRED = '登录过期',
  NOT_USERS = '用户不存在',
  ERROR = '服务器错误',
  MUST_JSON_FILE = '必须是json文件',
  WRONG_PHONE_NUMBER = '手机号格式错误',
  USER_EXISTS = '用户已存在',
  REPEAT_LOGIN = '重复登录',
  WRONG_PASSWORD = '密码不正确',
  NOT_PASSWORD = '未输入密码',
  MISSING_PARAMS = '缺少必要参数',
  PASSWORD_FORMAT_ERR = '至少8个字符, 包含字母、数字和特殊字符',
  NOT_VERIFICATION = '未输入验证码',
  VERIFICATION_ERROR = '验证码错误',
}

export default RequestErrText;
