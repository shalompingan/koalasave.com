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
