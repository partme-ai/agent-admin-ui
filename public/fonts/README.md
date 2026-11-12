# TinyBot 免费中文字体

当前提供30款网页字体（25款含中文、5款拉丁/等宽），原6个系统字体标识只读兼容，不再列为可选项。默认阿里普惠体，缺字优先使用随包Noto字库。所有字体原文件未经修改，MiSans沿用官方unicode分片；仅按选择与需要字符请求本地资源。未安装系统字库，不增加npm依赖。

| 字体 | 提供方 | 来源 | 许可/声明 |
|---|---|---|---|
|阿里巴巴普惠体 3.0|阿里巴巴|[官方](https://www.alibabafonts.com/)|[官方免费商用声明](licenses/Alibaba-NOTICE.md)|
|小米 MiSans|小米|[官方](https://hyperos.mi.com/font/zh/faq/)|[MiSans字体知识产权许可协议](licenses/MiSans-license.pdf)|
|Noto 黑体（简中）|Google / Adobe|[官方](https://github.com/google/fonts/tree/main/ofl/notosanssc)|[SIL OFL 1.1](licenses/notosanssc-OFL.txt)|
|Noto 宋体（简中）|Google / Adobe|[官方](https://github.com/google/fonts/tree/main/ofl/notoserifsc)|[SIL OFL 1.1](licenses/notoserifsc-OFL.txt)|
|霞鹜文楷 · 轻便版|LXGW|[官方](https://github.com/lxgw/LxgwWenKai-Lite)|[SIL OFL 1.1](licenses/wenkai-OFL.txt)|
|霞鹜文楷等宽 · 轻便版|LXGW|[官方](https://github.com/lxgw/LxgwWenKai-Lite)|[SIL OFL 1.1](licenses/wenkai-OFL.txt)|
|得意黑|atelierAnchor|[官方](https://github.com/atelier-anchor/smiley-sans)|[SIL OFL 1.1](licenses/smiley-OFL.txt)|
|站酷小薇体|ZCOOL / Google Fonts|[官方](https://github.com/google/fonts/tree/main/ofl/zcoolxiaowei)|[SIL OFL 1.1](licenses/zcoolxiaowei-OFL.txt)|
|站酷快乐体|ZCOOL / Google Fonts|[官方](https://github.com/google/fonts/tree/main/ofl/zcoolkuaile)|[SIL OFL 1.1](licenses/zcoolkuaile-OFL.txt)|
|马善政楷书|Google Fonts|[官方](https://github.com/google/fonts/tree/main/ofl/mashanzheng)|[SIL OFL 1.1](licenses/mashanzheng-OFL.txt)|
|龙藏体|Google Fonts|[官方](https://github.com/google/fonts/tree/main/ofl/longcang)|[SIL OFL 1.1](licenses/longcang-OFL.txt)|

许可与来源索引可从界面“来源与授权”打开。不要将免费商用等同于均为开源；阿里与小米沿各自官方条件。原字体独立分发受原许可约束。本目录仅随TinyBot应用提供，部署不依赖外部CDN。

`manifest.json`记录每个原始资源URL、字节数和SHA-256。`scripts/fetch_theme_fonts.py`仅在明确获取字体时手动运行，构建只复制已保存资源。

## 1.74 新增19款

新增字体均来自作者官方发布或Google Fonts官方仓库，许可为SIL OFL 1.1；允许商业使用和网页嵌入，保留版权和许可，不单独售卖字库。未修改、转换字体文件。繁中字库缺少的简体字、拉丁字体的中文均回退到随包Noto。

| 字体 | 来源 | 许可 |
|---|---|---|
|站酷庆科黄油体|[官方](https://github.com/google/fonts/tree/main/ofl/zcoolqingkehuangyou)|[OFL 1.1](licenses/zcoolqingkehuangyou-OFL.txt)|
|志莽行书|[官方](https://github.com/google/fonts/tree/main/ofl/zhimangxing)|[OFL 1.1](licenses/zhimangxing-OFL.txt)|
|刘建毛草|[官方](https://github.com/google/fonts/tree/main/ofl/liujianmaocao)|[OFL 1.1](licenses/liujianmaocao-OFL.txt)|
|jf open 粉圆（繁中）|[官方](https://github.com/google/fonts/tree/main/ofl/huninn)|[OFL 1.1](licenses/huninn-OFL.txt)|
|Chocolate Classical Sans（繁中）|[官方](https://github.com/google/fonts/tree/main/ofl/chocolateclassicalsans)|[OFL 1.1](licenses/chocolateclassicalsans-OFL.txt)|
|芫荽（繁中）|[官方](https://github.com/google/fonts/tree/main/ofl/iansui)|[OFL 1.1](licenses/iansui-OFL.txt)|
|昭源黑体（香港）|[官方](https://github.com/google/fonts/tree/main/ofl/chironheihk)|[OFL 1.1](licenses/chironheihk-OFL.txt)|
|Inter|[官方](https://github.com/google/fonts/tree/main/ofl/inter)|[OFL 1.1](licenses/inter-OFL.txt)|
|Roboto|[官方](https://github.com/google/fonts/tree/main/ofl/roboto)|[OFL 1.1](licenses/roboto-OFL.txt)|
|JetBrains Mono|[官方](https://github.com/google/fonts/tree/main/ofl/jetbrainsmono)|[OFL 1.1](licenses/jetbrainsmono-OFL.txt)|
|Fira Code|[官方](https://github.com/google/fonts/tree/main/ofl/firacode)|[OFL 1.1](licenses/firacode-OFL.txt)|
|Source Code Pro|[官方](https://github.com/google/fonts/tree/main/ofl/sourcecodepro)|[OFL 1.1](licenses/sourcecodepro-OFL.txt)|
|Noto 黑体（繁中）|[官方](https://github.com/google/fonts/tree/main/ofl/notosanstc)|[OFL 1.1](licenses/notosanstc-OFL.txt)|
|Noto 宋体（繁中）|[官方](https://github.com/google/fonts/tree/main/ofl/notoseriftc)|[OFL 1.1](licenses/notoseriftc-OFL.txt)|
|霞鹜文楷（繁中）|[官方](https://github.com/google/fonts/tree/main/ofl/lxgwwenkaitc)|[OFL 1.1](licenses/lxgwwenkaitc-OFL.txt)|
|霞鹜文楷等宽（繁中）|[官方](https://github.com/google/fonts/tree/main/ofl/lxgwwenkaimonotc)|[OFL 1.1](licenses/lxgwwenkaimonotc-OFL.txt)|
|辰宇落雁体（繁中）|[官方](https://github.com/Chenyu-otf/chenyuluoyan_thin)|[OFL 1.1](licenses/chenyu-OFL.txt)|
|霞鹜文楷 · 屏幕版|[官方](https://github.com/lxgw/LxgwWenKai-Screen)|[OFL 1.1](licenses/wenkai_screen-OFL.txt)|
|霞鹜文楷 · GB屏幕版|[官方](https://github.com/lxgw/LxgwWenKai-Screen)|[OFL 1.1](licenses/wenkai_gb_screen-OFL.txt)|
