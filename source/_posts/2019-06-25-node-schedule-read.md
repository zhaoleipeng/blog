---
title: node-schedule的一些分析
date: 2019-06-25 13:41:59
tags: [源码, Node.js]
categories: 技术
toc: true
---

这个包是用来做定时任务执行相关的内容的。可在node.js环境下执行类似linux下cron的功能。
<!-- more -->

## 先介绍下这个包是干嘛的

> [node-schedule](https://github.com/node-schedule/node-schedule#readme)是一个
> A cron-like and not-cron-like job scheduler for Node

这个包可以做到在node环境中实现定时触发某些任务的效果。

使用方法在github文档里面都找的到我这里就不赘述了。

## 为啥会找到这个包

因为项目无法自动化。定时任务部分的设置，在上线的时候需要手动的在服务器的cron上面去设置，所以成为了自动化部署的阻碍。所以想要改变这种情形于是想起来之前同事推荐的这个库。

## 具体的应用场景

项目中会有些在半夜执行触发的定时任务，此时会通过直接调用内部API的方式进行触发。

## 产生了疑惑

我比较好奇这个是怎么实现定时任务的。比如我传了一个`cron format`格式的时间。他怎么做到能够按这个时间执行的嘞。

## 源码的观察

我将源码首先先看这部分代码

``` js
function scheduleJob() {
  if (arguments.length < 2) {
    return null;
  }

  var name = (arguments.length >= 3 && typeof arguments[0] === 'string') ? arguments[0] : null;
  var spec = name ? arguments[1] : arguments[0];
  var method = name ? arguments[2] : arguments[1];
  var callback = name ? arguments[3] : arguments[2];

  var job = new Job(name, method, callback);

  if (job.schedule(spec)) {
    return job;
  }

  return null;
}
```

会先去`new Job`

那么就去找`Job`的实现方法。`Job`的实现方法太长了就不全贴出来了

``` js
// Make sure callback is actually a callback
  if (this.job === name) {
    // Name wasn't provided and maybe a callback is there
    this.callback = typeof job === 'function' ? job : false;
  } else {
    // Name was provided, and maybe a callback is there
    this.callback = typeof callback === 'function' ? callback : false;
  }
```

这段就知道会对`callback`进行执行。如果想要最快的找到怎么实现定时的实现。那么既然要找到执行这个`callback`的方法，毕竟到点了肯定是执行传入的回调的。

```js
function prepareNextInvocation() {
  if (invocations.length > 0 && currentInvocation !== invocations[0]) {
    if (currentInvocation !== null) {
      lt.clearTimeout(currentInvocation.timerID);
      currentInvocation.timerID = null;
      currentInvocation = null;
    }

    currentInvocation = invocations[0];

    var job = currentInvocation.job;
    var cinv = currentInvocation;
    currentInvocation.timerID = runOnDate(currentInvocation.fireDate, function() {
      currentInvocationFinished();

      if (job.callback) {
        job.callback();
      }

      if (cinv.recurrenceRule.recurs || cinv.recurrenceRule._endDate === null) {
        var inv = scheduleNextRecurrence(cinv.recurrenceRule, cinv.job, cinv.fireDate, cinv.endDate);
        if (inv !== null) {
          inv.job.trackInvocation(inv);
        }
      }

      job.stopTrackingInvocation(cinv);

      job.invoke(cinv.fireDate instanceof CronDate ? cinv.fireDate.toDate() : cinv.fireDate);
      job.emit('run');
    });
  }
}
```

这段代码里面找到了`job.callback()`，可以看到执行条件为`runOnDate`那么就到了解谜的时候了。

``` js
/* Date-based scheduler */
function runOnDate(date, job) {
  var now = Date.now();
  var then = date.getTime();

  return lt.setTimeout(function() {
    if (then > Date.now())
      runOnDate(date, job);
    else
      job();
  }, (then < now ? 0 : then - now));
}
```

会发现这玩意是在头部引用的一个外部包`lt`就是`lt = require('long-timeout')`这个项目还是挺简单的，会发现基本就是对于`setTimeOut`的一个封装。

## 结论

到此为止结论就显而易见了

这个库做到定时执行的根本是基于`setTimeOut`的。

通过之前对于`Node.js`的时间循环的分析，可以知道，`timer`阶段的执行不一定是严格按照那个时间来的。会受整个`Node`循环执行情况的影响。

**所以如果需要精确到很精确的时间，还是得通过别的方案来解决**，如果这个不算太精确的时间可以接受，那么把定时任务模块拆出来，通过这个定时任务模块来实现，也不失为一种方式。
