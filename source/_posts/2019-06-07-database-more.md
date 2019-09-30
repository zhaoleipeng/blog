---
title: 数据库基础概念 索引
date: 2019-06-07 13:16:57
tags: [ 数据库, 索引, MySQL ]
categories: 技术
toc: true
---

这段时间正好在看极客时间的`MySQL实战45讲`，听得有点上头，感觉蛮有意思的，就顺带整理一些索引相关的知识。

<!-- more -->
## 常见的索引类型

- **MySQL的索引**
  `B+Tree` 和 `BTree`

- **B+Tree**
  
- **BTree**

## 数据库的一些短问题

- **B+tree的N叉树，N是由什么决定的**
  N叉树是由页大小和索引大小决定的

- **删除数据后索引不会被删除**
  某种情况下导致一个项目的数据库表大小10G，索引大小30G。
  
  如果是主键的话，重建表可以重建主键索引。
  > 因为无论删除主键和新增主键都会重建表，所以直接重建表

  ``` sql
  alter table T engine=InnoDB
  ```

  如果是非主键索引，drop后添加即可。
  
  ``` sql
  alter table T drop index k;
  alter table T add index(k);
  ```

## 数据库的一些长问题

一个表结构定义如下的一张表

``` sql
CREATE TABLE `geek` (
`a` int(11) NOT NULL,
`b` int(11) NOT NULL,
`c` int(11) NOT NULL,
`d` int(11) NOT NULL,
PRIMARY KEY (`a`,`b`),
KEY `c` (`c`),
KEY `ca` (`c`,`a`),
KEY `cb` (`c`,`b`)
) ENGINE=InnoDB;
```

但是既然主键包含了 a、b 这两个字段，那意味着单独在字段 c 上创建一个索引，就已经包含了三个字段了呀，为什么要创建`“ca”``“cb”`这两个索引？

如果为了解决如下使用场景添加的索引是否合理。

``` sql
select * from geek where c=N order by a limit 1;
select * from geek where c=N order by b limit 1;
```

---

答案如下：
  
表记录

| a | b | c | d |
| :-: | :-: | :-: | :-: |
| 1 | 2 | 3 | d |
| 1 | 3 | 2 | d |
| 1 | 4 | 3 | d |
| 2 | 1 | 3 | d |
| 2 | 2 | 2 | d |
| 2 | 3 | 4 | d |

  主键 `a，b` 的聚簇索引组织顺序相当于 `order by a,b`，也就是先按 `a` 排序，再按 `b` 排序，`c` 无序。

  索引 `ca` 的组织是先按 `c` 排序，再按 `a` 排序，同时记录`主键`

| c | a| 主键部分b `（注意，这里不是ab，而是只有 b）`|
| :-: | :-: | :-: |
| 2 | 1 | 3 |
| 2 | 2 | 2 |
| 3 | 1 | 2 |
| 3 | 1 | 4 |
| 3 | 2 | 1 |
| 4 | 2 | 3 |

  这个跟索引 c 的数据是一模一样的。

  索引 `cb` 的组织是先按 `c` 排序，在按 `b` 排序，同时记录`主键`
  
| c | b |主键部分a`（注意，这里不是 ab，而是只有 a）`|
| :-: | :-: | :-: |
| 2 | 2 | 2 |
| 2 | 3 | 1 |
| 3 | 1 | 2 |
| 3 | 2 | 1 |
| 3 | 4 | 1 |
| 4 | 3 | 2 |

  所以，结论是 `ca` 可以去掉，`cb` 需要保留。



|事务A| 事务B|
|----|----|
|begin transaction||
| |begin transaction|
|select * from payment where id = A||
||select * from payment where id = A|
|insert B||
||insert C|
|update A(比如就更新status)||
| commit ||
||update A|
||commit A(比如就更新status)|
