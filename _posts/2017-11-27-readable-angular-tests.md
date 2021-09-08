---
layout: post
title: "readable angular tests"
comments: true
---
readable angular tests

In this post, I'll provdes some tips to create readable angular test.

### General Tips
#### Use describe or nested describe to structure specs
- Use top level describe to describe a public function or a feature of the component to be tested.
- Use nested describe to group specs which share the same context.Check the following example:

```javascript
//top level describe
describe('#landing page', function() {
    //nested describe
    describe('logged in as admin', function() {
        beforeEach(function(){
            //context setup code for an admin user
        });
        it('should be able to see admin link', function() {});
        it('should be able to see greeting message', function() {});
    });
	describe('login as member', function() {
        beforeEach(function () {
            //context setup code for an memebr user
        });
        it('should not be able to see admin link', function() {});
        it('should be able to see greeting message', function() {});
	});
});
```
#### Put variable declaration close to usage.
It is quite common to see a bunch of local variables defined at the top of a spec then initialize them somewhere else in the code. It makes it super hard to understand the value and usage of those variables when going through the code.

### Service Specs Tips
##### Put more business logic into Service.
  Some services we created are just a very thin wrap of $http, Eg. :

```javascript
angular
    .module('MyApp')
    .service('MyService', ['$http', 
    function ($http) {
        this.get = function (projectId, myId) {return $http.get('/projects/' + projectId + '/something/' + myId);};
    }]);
```
dead simple but is it worth to test it?

Encapsulating business logic into Service instead of Controller or Directive will lead to a higher test coverage of the code.

### Directive Specs Tips
Directive is hard to test, here're some tips:
##### Make directive as small as possible  
One common mistake I observed is that directives have too much responsiblity.  
Only have view/rendering related code should live in directive, any other business logic should be extracted into a service.
  If the "extra" code is related another view extract into another directive.

#####  Limit the usage of $scope variables.
In most cases, a private variable is good enough.
Compared to private variable, scope variables are public accessiable, which violate the [encapsulation princaple](https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)). Also, scope variables are bound to directive lifecycle. check the following example.

```javascript
angular.module('MyApp')
.controller('MyController', ['$scope', '$stateParams', 'MyService',
function ($scope, $stateParams, MyService) {
	var self = this;
	self.isAdmin = false;
	self.canCreateUser = false;
	self.myDomain = null;
	//...
	MyService.get($scope.myId).then(function(data){
	    self.myDomain = data;
	});
	//...
}
```
##### Simple template
  Avoid bussiness logic in templates.
  Replace them with directive methods that express the intent of the logic, Eg. :

```javascript
  //Before Refactor
  //directive
  $scope.isAdmin = ...;
  $scope.canCreateUser  = ...;
  $scope.isFriday = ...;

//template
<a ng-if="isOwner && canEditDocument && isFriday">click me</a>
```

```javascript
//After refactor
//directive
$scope.isEditable = function(){
    return self.isAdmin && self.canCreateUser && self.isFriday
}

//template
<a ng-if="isEditable()">click me</a>
//Three scope variables were replaced by one scope function
```
##### Do not test directive template
Given we have made the template simple,  we don't need to test them.
Testing directive methods(e.g. isEditable) is much easier to deal with doms in template, but provides enough confidence of quality.
