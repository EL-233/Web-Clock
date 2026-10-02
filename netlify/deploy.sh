#!/bin/sh
# 把 _redirects 临时放进 clock-site/，等你在 Netlify 拖完，再删掉。
#
# 为什么要这么绕：Netlify 需要这个文件做天气代理，Cloudflare 则拒绝它
# （不允许 200 代理指向外部域名），而两者用的是同一个目录 —— 只能来回搬。
#
# 用法：在 Git Bash 里跑
#     sh "D:/Eric/AI Playground/netlify/deploy.sh"
#
# ⚠️ 别用 Netlify 的「连 Git」自动部署：那样每次 git push 都会触发一次
#    Netlify 部署，一次吃掉 15 credits，一个月只有 300 —— 20 次就没了。
#    所以 Netlify 那边用手动拖拽（Netlify Drop），Cloudflare 那边才用自动构建。

set -e
cd "$(dirname "$0")/.."

echo "仓库目录: $(pwd)"
echo

if [ ! -d clock-site ]; then
  echo "❌ 找不到 clock-site/ —— 这个脚本得在仓库里跑" >&2
  exit 1
fi

cp netlify/_redirects clock-site/_redirects
echo "✅ 已把 _redirects 放进 clock-site/"
echo
echo "──────────────────────────────────────────────"
echo " 现在去 https://app.netlify.com/drop"
echo " 把 clock-site 这个【文件夹】拖进去，等它部署完。"
echo "──────────────────────────────────────────────"
echo
printf "部署完成后按回车，我把 _redirects 删掉："
read _ignored

rm -f clock-site/_redirects
echo
echo "✅ 已删除。Cloudflare 的构建不会再被打断了。"
echo "   （忘了删的话，下次 push 时 Cloudflare 会报 code 100324）"
