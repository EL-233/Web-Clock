/* Cloudflare Worker —— 只做一件事：把 /weather 同源代理到 Open-Meteo。
 *
 * 为什么需要它（这是整个项目的关键约束）：
 *   api.open-meteo.com 用的是 Let's Encrypt 证书，而这台 iPad 2
 *   （iOS 9.3.5）【不信任 Let's Encrypt 的根 ISRG Root X1】——
 *   直连会【静默失败】：页面照常显示，天气栏永远空白，且不报任何错。
 *   走这条同源代理后，浏览器只请求自己域名下的 /weather，
 *   由 Cloudflare 的服务器去取真正的接口再回传。
 *
 *   （原先在 Netlify 上用 _redirects 的 200 rewrite 做同一件事。
 *    换到 Cloudflare 不能照搬：Pages 的 _redirects 【不支持代理外部域名】，
 *    官方给的替代方案就是 Pages Functions / Worker。）
 *
 * 路由（不用配置，是 Workers 静态资源的默认行为）：
 *   请求路径【匹配到 clock-site/ 里的静态文件】→ 直接由 Cloudflare 送出，
 *                                                   不经过本脚本（免费、也不拖慢）
 *   请求路径【没匹配到】→ 落到这里
 *   而 /weather 不是静态文件 → 必然走这里 ✓
 */

const UPSTREAM = 'https://api.open-meteo.com/v1/forecast';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/weather') {
      // 把查询串原样转给上游（latitude/longitude/hourly/... 都在里面）
      const res = await fetch(UPSTREAM + url.search);
      // 只回传内容体和状态码。上游其余响应头没有必要透传，
      // 尤其是缓存相关的 —— 前端每次请求都带破缓存参数 `_=`。
      return new Response(res.body, {
        status: res.status,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // 兜底：交给静态资源。正常情况下走不到这里。
    return env.ASSETS.fetch(request);
  },
};
