# 移动端导航栏格式

手机端（≤768px）导航使用右侧滑入抽屉式菜单：

- 汉堡按钮点击后，右侧滑入 280px 宽抽屉面板（`right:0; width:280px; transform:translateX(100%) → translateX(0)`）
- 背景色与顶部导航栏一致：`rgba(30,58,95,.98)` + `backdrop-filter:blur(12px)`
- 半透明遮罩覆盖页面内容（`.nav-overlay`），点击遮罩关闭菜单
- 菜单打开时 body `overflow:hidden` 禁止滚动
- 按钮图标切换：`.menu-icon` 和 `.close-icon` 通过 `.open` class 切换 display
- 文字左对齐，左边距 28px（`padding:10px 28px`）
- `.nav-main-links` 和 `.nav-tools-section` 均设 `width:100%`
- 桌面端隐藏分隔线和工具区：`.nav-divider,.nav-tools-section{display:none}`，手机端改为 `display:block`

JS 逻辑：
```js
(function(){var b=document.querySelector('.nav-toggle'),n=document.querySelector('.nav-links'),o=document.querySelector('.nav-overlay');function op(){n.classList.add('open');b.classList.add('open');o.classList.add('open');document.body.style.overflow='hidden'}function cl(){n.classList.remove('open');b.classList.remove('open');o.classList.remove('open');document.body.style.overflow=''}b.addEventListener('click',function(e){e.stopPropagation();n.classList.contains('open')?cl():op()});o.addEventListener('click',cl);n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',cl)})})();
```

# 执行规则

- **只执行用户明确要求的修改**：不得自行修复任何布局、样式、功能、结构问题，哪怕明显有问题。用户没让改的，一概不动。
- **发现问题必须告知**：无论是布局、样式、功能、结构、内容、引用来源等任何问题，不管明显还是不明显，一律先告知用户，不得擅自跳过或忽略，也不得未经确认直接修改。
- **不部署，除非用户说部署**：改完代码后不得自行部署、发布、或触发任何部署流程。只有用户明确说"部署"或"发布"时才执行。
- **禁止使用 emoji 图标**：所有页面一律不使用 emoji 作为装饰图标。导航链接、标题、卡片图标、按钮等均不得包含 emoji。
- **改完 .html 文件必须跑构建检查**：修改任何页面源码后，运行 `node build.js` 确认没有报错（能挡住语法层面的低级错误），确认无误再告知用户改完了。

# 数据维护规则

- **经常变动的数字要单独拆成 JSON 文件**：如果某个工具/文章页面包含会被定期更新的数据（利率、汇率、价格等，尤其是有对应定时检查任务的），不要把这些数字硬编码在压缩成单行的 HTML/JS 里——参考 `best-high-yield-savings-accounts/index.html` + `hysa-rates.json` 的做法：把数据拆到站点根目录下的一个独立小型 JSON 文件，页面用 `fetch()` 加载，并把该 JSON 文件加进 `build.js` 的 `STATIC_FILES` 数组。
- **新建这类页面，或发现已有页面符合这个模式时，主动向用户提出要不要做同样的拆分**，不要未经确认直接重构（仍然遵守上面"发现问题必须告知"的规则）。

# 定时检查计划该放多久一次

新建文章/页面，或者在审查已有页面时发现里面有"会过期的数字"（利率、汇率、价格、行业调查统计等），判断要不要建/加入定时检查任务，看的是**这个数字在真实世界里本来多久会变一次**，而不是固定套用某个周期。参考已有的三个定时任务分类：

- **每周**：数字本身波动就很频繁、而且用户会拿它做实际决策的（比如各家银行的HYSA利率——银行随时会调）。对应 `koalasave-hysa-rate-check`。
- **每季度**：几个月才会变一次，或者文章里本来就是模糊区间表述、不是精确到小数点的实时数据（比如房贷利率、汇率这种"大约在X左右"的说法）。对应 `koalasave-quarterly-rate-check`。
- **每年**：只有官方年度报告/调查才会刷新的数据（比如CNET年度订阅调查），或者价格变动没有固定周期、但一年检查一次基本能跟上的（比如Netflix这类偶尔涨价的订阅费）。对应 `koalasave-annual-subscription-data-check`。
- **不需要建定时任务**：一次性的历史引用，比如某一年做的学术研究、某一年的调研快照（如2022年C+R Research那种）——这些不会再"更新"，只需要在常规审查时确认引用和归属没写错，不用周期性重查。

如果新页面的数据不确定属于哪一档，或者感觉几个档都不太贴合，先跟用户说明情况、问清楚，不要自己随便归类硬塞进某个已有任务里——塞错了要么白跑（数据根本没变），要么查漏了该盯的东西。
