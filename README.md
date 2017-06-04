# Safari extension for Shanbay.com

## 基本介绍
这是一款基于 [扇贝网API](http://www.shanbay.com/support/dev/api.html) 的Safari扩展。

基本功能为在Safari中浏览任意网页时，选中一个单词，右键菜单中选择‘扇贝查词’，便在导航条附件显示该单词在扇贝网的中英文解释和发音。你可以选择把该词加入生词本，已加强记忆。

## 安装说明
请下载 [shanbay-safari-extension.safariextz](https://github.com/jove/shanbay-safari-extension/raw/master/shanbay-safari-extension.safariextz) 文件。并用Safari打开。系统会提示是否信任该扩展，点击确定。

Safari的Extensions界面会显示配置界面 OAuth Token:

第一次使用该工具，不用管它
打开一个网页，或重刷当前页面，在工具栏会有扇贝图标，点击它，在弹出窗口登录，然后给予授权，之后此插件便可使用。30天免登录 (得益于OAuth)。

## 已知问题

* 扇贝网尚不支持短语和整句翻译

## 开发说明

* 扇贝网开发者主页： <http://www.shanbay.com/developer/wiki/intro/>
* 开发测试方案
	* 推荐使用Mac OS X，使用Safari的Extension Builder。10.10之后需要开发者证书(抱歉我不能共享我的证书)
	* git clone 此项目，然后在Extension Builder中打开shanbay-safari-extension.safariextension目录
    * 然后可以deploy extension。开一个页面，打开popover，登录，用inspector来调试
    * 改完代码后，使用Extension Builder的Reload功能，重新调试
    * 因为使用了我的证书，你可能不能打包。需要话我再把证书公私钥放上来

## 致谢

* 感谢扇贝网提供了极好的互动式英文学习工具和社区。你可以免费使用，并按实际需要获取付费资源
* 感谢 <https://github.com/gamerh2o/shanbay-chromium-extension> 本项目完全是对该Chrome扩展的Safari移植。

## 后续计划

目前的UI是继承 <https://github.com/gamerh2o/shanbay-chromium-extension>
太多全局函数，DOM的直接操作。考虑使用React.js重构

## 版本变更

* v0.1, Feb 4, 2013: 初始版本
* v0.2, Feb 14,2014 ( 情人节啊 T__T): 改进取词逻辑。
	1. 即使多个词被右键选中，也只查询第一个词
	2. 终于能够处理复数和动名词等结构。选中一个词后先得到他的原型，再查询
* v0.3, Mar 25, 2015: 修复不能查词的问题
* v0.3.1, Mar 26, 2015: 修复添加生词本会覆盖当前页面的问题
* v0.4.0, Mar 29, 2015: 转用OAuth和扇贝新的API，现在可以查看新加单词的详细页面
* v0.4.1, Jun 4, 2017: 重新捡起，修复单击读音会播放2次的问题 (取消mousehover读词)

