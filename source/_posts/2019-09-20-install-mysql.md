---
title: macos上安装mysql
date: 2019-09-20 14:26:08
tags: ['数据库']
categories: 技术
toc: true
---
每次新到一台电脑，都要重新配置一遍mysql本地安装，感觉有点窒息，这里想把整体安装的流程整理一下，省的再搜了。
整体安装是当下最新版的`mysql`是`8.0.17`，不能保证其他版本兼容。
至于为啥近期各种新电脑要配置，那就是另一个故事了。

<!-- more -->

## 安装mysql

``` bash
brew install mysql
```

## 启动mysql

``` bash
brew services start mysql
```

## 进入mysql

``` bash
mysql -u root -p
```

初始情况下`root`角色没有密码，所以直接回车就进入了。

## 给自己的用户赋予权限

### 创建账号

``` bash
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
```

中间的`username`和`password`替换成自己的东西。

### 给账号赋予权限

``` bash
GRANT ALL ON *.* TO 'username'@'localhost';
```

给指定`username`的账号赋予了所有的增删改权限。

## 登录

``` bash
mysql -p
```

然后输入密码就可以登录进入了，后续就自己玩吧~

## 额外的工具

可以考虑使用`mycli`工具，整体功能强大，操作方便。

``` bash
brew install mycli
```

## mycli安装完成

``` bash
mycli
```

输入相应的密码就可以了。
