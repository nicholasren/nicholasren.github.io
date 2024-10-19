---
layout: post
title: "Implementing CorrelationID In Kafka Stream"
comments: true
---

今天在实现 `Logging Correlation ID` 的功能。理想状态下，我是期望能够在不影响业务逻辑代码的情况下，参照AOP的理念，给Topology的每个processor的增加如下行为：  
- 从header提取`CorrelationID`
- 把`CorrelationID` 设置到 **M**apped **D**iagnositc **C**ontext（其底层用ThreadLocal实现）
- 在logger的 pattern增加 `CorrelationID`
- 清理**M**apped **D**iagnositc **C**ontext
  
这样业务代码不需要做任何改动就可以获得打印correlationID的能力。  然而由于KafakStream的dsl不暴露`ConsumerRecord`给我们，操作header并不是特别方便。  参见Kafka Record Header的背景以及使用场景。  

Zipkin中对KafkaStream的tracing的[实现方式](https://github.com/openzipkin/brave/blob/master/instrumentation/kafka-streams/src/main/java/brave/kafka/streams/KafkaStreamsTracing.java)与我在前一个项目中做的[SafeKafkaStream](https://medium.com/@hussein.joe.au/safe-streams-a3ac49bfc091)的实现方式非常类似：通过一个wrapper，实现`KafkaStream`接口，把各种operation delegate到wrapper例的delegatee并添加额外的行为。

最后采取的思路如下：
- 使用原始消息的payload中的id作为correlation id,使用一个“知道如何从各种类型的Record中提取correlation id”的`CorrelationIDExtractor`提取 correlationId
- 把各个operator的参数, 大多为一个 function，使用 `withContext` 装饰起来，在装饰后的function里进行 `setup`和`cleanup`的操作。

这种折衷的方案仍然有如下优点:
- CorrelationID的获取集中在CorrelationIDExtractor这个一个地方，后续如果KafkaStream有更新对header的支持很容易切换到新的方案。
- `withContext`尽量减少了对业务代码的侵入。