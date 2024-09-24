/**
 * Environments variables declared here.
 */

/* eslint-disable node/no-process-env */

export default {
  NodeEnv: process.env.NODE_ENV ?? '',
  Port: process.env.PORT ?? 0,
  Cookie: {
    Key: 'ExpressGeneratorTs',
    Secret: process.env.COOKIE_SECRET ?? '',
    // Casing to match express cookie options
    Options: {
      httpOnly: true,
      signed: true,
      path: process.env.COOKIE_PATH ?? '',
      maxAge: Number(process.env.COOKIE_EXP ?? 0),
      domain: process.env.COOKIE_DOMAIN ?? '',
      secure: process.env.SECURE_COOKIE === 'true',
    },
  },
  Jwt: {
    Secret: process.env.JWT_SECRET ?? '',
    Exp: process.env.JWT_EXP ?? '', // exp at the same time as the cookie
  },
  EncryptPwd: {
    Key: process.env.ENCRYPT_PASSWORD_KEY ?? '',
    Iv: process.env.ENCRYPT_PASSWORD_IV ?? '',
  },
  DataBase: {
    host: process.env.DB_HOST ?? '',
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER ?? '',
    pwd: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? '',
  },
} as const;
