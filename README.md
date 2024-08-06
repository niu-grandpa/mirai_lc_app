## MIRAI 低代码UI设计平台

> 正在持续开发中...

#### Client 前端源码

技术栈：Rsbuild + Typescript + Vue3.0 + Vue Router + Pinia + Antd Vue + InteractJs

本地运行

```shell
npm run dev
```

打包构建

```shell
npm run build
```

部署

> 推荐使用免费的 [Vercel](https://vercel.com/) 自动化部署，它会帮开发者生成对应的https域名网站，省去了繁琐的备案流程

#### Server 后端源码

技术栈：NodeJs + Express + MySQL + Typescript

启动本地服务

```shell
npm run serve
```

部署

> 如果不想购买域名进行备案的话，可以自行搜索如何将服务器地址变为用 https 访问，这样在调用接口时就能使用 https://xxxx，不影响线上运行