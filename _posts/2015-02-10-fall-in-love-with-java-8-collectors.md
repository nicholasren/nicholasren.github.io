---
layout: post
title: "fall-in-love-with-java-8-collectors"
comments: true
---

Java 8 has been released quite a long time, since I come to ruby in 2011, I haven't work with java. Even I heard that there're few __cool__ features come out with Java 8, like `lambda`, `stream collection`, `functional interface`, `new date api`. none of them can attract me, given ruby ship all these features since the date of birth.

While recently I do try to solve a problem with Java, and I found that Java has changed a lot compared with my impression on it.  in this post, I'm going to talk about the collectors shipped with Java 8. also I'll try to give collector example in scala.

#### The Problem
__Reduction__, (aka. iterating on a collection, apply reduction computation on each elements, and produce a single result or a smaller collection) is a common problem in any programming language.

Let's look at a specific example:

Given an collection of employees, grouping these employees by age produce a map between age and list of employees.

Here is the class definition of Employee:
```java
class Employee{
    private int age;
    private String name;

    Employee(String name, int age) {
        this.age = age;
        this.name = name;
    }
}
```

### The Solution
a simple implementation could be:

```java
List<Employee> employees = Arrays.asList(new Employee("A", 18), new Employee("B", 20), new Employee("C", 18));
Map<Integer, List<Employee>> byAge = new HashMap<>();
for(Employee employee: employees) {
  List<Employee> employeeByAge = byAge.get(employee.getAge())
  if(employeeByAge = null) {
    employeeByAge = new ArrayList<>();
  }
  employeeByAge.add(employee);
  byAge.put(employee.getAge(), employeeByAge);
}
```
if you have been working with Java for quite a long time, you may be sick to write these code. you must have write code in this structure for quite a long time.
to demonstrate the duplication of this structure, let's rewrite the above code to this format:

```java
Collection<T> collections = ...
Collection<R> results = new SomeCollection;

for(T t: in collections) {
  R r = results.get(t)
  if (r == null) {
    r = new R
  }
  r.add(t)
}
```

all these code did is to collect some information for give collection and apply reduction on the items in this collection and produce a result container.

with Java 8s collector interface, you can simply do
```java
List<Employee> employees = Arrays.asList(new Employee("A", 18), new
Map<Integer, List<Employee>> byAge = strings.stream().collect(Collectors.groupingBy((e) -> e.age));
```

so what is the magic behind it:

The magic is behind the `Collector<T, A, R>` interface:

`Collectors.groupingBy` is a built in collector which acceptting a function with type `T -> K` which can be group against(in this case, `employee.age()`).
it will produce a result with type `Map<K, List<T>>`(aka, the result type `R`).

Here is the official definition of Collector from its [api document](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collector.html):
> A mutable reduction operation that accumulates input elements into a mutable result container, optionally transforming the accumulated result into a final representation after all input elements have been processed. Reduction operations can be performed either sequentially or in parallel.

You see from the docCollector take three type parameters `T`, `A` and `R`, where `T` is the type of element inside the collection, `A` is an intermediate type which could be used to do the mutable reduction, `R` is the type of result.

There four functions in this interface which work together to accumulate entries into a mutable result container.
- supplier(), with type `() -> A` - creation of a new result container.
- accumulator(), with type`(A, T) -> A` - incorprating a new element into the result container.
- combiner(), with type `(A, A) -> A` - combing two result container into one.
- finisher(), with type `A -> R` - a optional final transformation on the result container to get the result. the __optional__ means that in some scenarios, `A` and `R` could be same, so the `finisher` function is not required. but in some other cases, when `A` and `R` are different, this function is required to get the final result.

In the previous example, the type of result of `Collector.groupingBy` is `Collector<Employee, ?, Map<Integer, List<Employee>>`.

one nice feature of `Collector` is that you can create you own Collector, this is super useful when you want to do a __mutable reduction__ on a collection with some special business logic(e.g. computing total salary of the first 1, 3, 5, 7 .. employees).` (this blog post)[http://www.nurkiewicz.com/2014/07/introduction-to-writing-custom.html] provide a fairly good example of how to create you own Collector.


###Collector in Scala
After found this useful pattern, I wonder if scala's powerful collection system support this computation. Unfortunately, I can not found a similar api from any collection type. But I do found that we can easily build our own version of collector based on `scala.collection.mutable.Builder`.

`scala.collection.mutable.Builder` play the same role with  `accumulator` (the `A`) in java Collector. Let's see the following example of how we implement the `collect` method in scala and how we use it to solve the word count problem:

```scala
import scala.collection.mutable.Builder

//`T` is the type of element in collection, `Builder` is the type of intermediate result container, `R` is the type of reduction result.
def collect[T, R] (ts: List[T], a: Builder[T, R]):R = {
  ts.foreach (a += _) //invoke the accumulator function
  a.result //invoke the finisher function
}

//word counting builder
//from Seq[String] to Map[String, Int]
class CounterBuilder[String, Map[String, Int]] extends Builder[String, Map[String, Int]] {

  var counter = scala.collection.mutable.Map[String, Int]()

  def += (el: String) = {
    counter.get(el)  match {
      case None => counter += el -> 1
      case Some(count) => counter += el -> (count + 1)
    }
    this
  }

  def clear = counter = scala.collection.mutable.Map[String, Int]()

  def result: Map[String, Int] = counter.toMap[String, Int].asInstanceOf[Map[String, Int]]
}
```

and here is the code to use the `CounterBuilder`
```scala
//use case
val xs = List("a", "a", "a", "c", "d")

//the supplier function
val builder = new CounterBuilder
val res = collect[String, Map[String, Int]] (xs, new CounterBuilder)
//output: Map(d -> 1, a -> 3, c -> 1)
```


### Conclusion

- Java 8s `Collector Api` provide a better way to encapsulate reduction computation - not only some built in reduction(e.g. max, min, sum, average), but also customized reduction(via customised collector), Collector is designed to be composed, which means these reduction logic are much easier to be reused.
- Scala do not have native support for __customised mutable reduction__, but based on scala's powerfull collection system, we can create our own version.

### References
- [Scala's CanBuildFrom](http://blog.bruchez.name/2012/08/getting-to-know-canbuildfromwithout-phd.html)
- [Collector API](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collector.html)
