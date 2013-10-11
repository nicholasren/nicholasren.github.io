---
layout: post
title: "Thoughts on design a RESTful API on RoR stack"
---
Recently I'm working a RoR stack RESTful API project, I was involved in proposing tech stack, architecture, deployment pipeline. There was many thoughts in this progress, so I wrote down our thoughts here, in case it may help you when you met a similar question.

### Tech Stack

There're bunch of api framework out there in ruby stack, such as [Grape](https://github.com/intridea/grape), [rails-api](https://github.com/rails-api/rails-api), [Sinatra](https://github.com/bmizerany/sinatra). I'll share my understanding here:

#### Sinatra
Sinatra providing a lightweight, simple DSL to creating web application. we can create a web/api application with sinatra within 15 seconds! the downside is, it is not a full stack framework, it requires us to combine sinatra with other frameworks. for example, we have a backend database for storing and retrieving information, you need to interating sinatra with a orm framework(e.g. ActivateRecrod or DataMapper).if we want to render info on a web page, we need to integrate a view template engine.

#### Grape
Grape is a ruby framework, which is designed for creating RESTful api service. it have sevural great features for creating RESTFul api. for example, api verisoning, automatic api doc generation, etc. Similar to sinatra, it is not a full stack framework, it requires some integration work. BTW, Grape can be easily integrated into any Rack application(e.g. sinatra, rails).

#### Rails::API
Rails::API is a subset of a normal Rails application, created for applications that don't require all functionality that a complete Rails application provides. It is a bit more lightweight, and consequently a bit faster than a normal Rails application. 

In the end, we choose **Rails::API** as our tech stack for the following reason:

+ it is a fullstack framework, including ORM, db migration, validation, etc all in one place.
+ we can leveage some rails's feature, e.g. generator, db migration.
+ it is a subset of rails, is designed for creating a API application.
+ rails's REST conversion.

If I had a chance to make this decision again, I would think **combining Grape with Rails::API**, then we can both Grape's great support on API and Rails::API's fullstack framework.

### API Design
#### Content Type Negotiation


A most important part of designing RESTful API is content-type negotiation. the content type negotiation can be both in request/response header and url suffix:

in request header, `Content-Type` indicating content type of data in request body, `Accept` telling server what kind of content type the client expected to accept.  

in response header, `Content-Type` indicating content type of data in the response body.    

Also, request to `/users/2.json` expecting the server return user info in JSON format, but request to `/users/2.xml` expecting get a XML response.

there're several kind of standard content type, e.g. `application/json`, `application/xml`. 
People can define their own content type, e.g. `application/vnd.google-apps.script+json`  
My feeling is, if your api is a public endpoint, you'd better define your own content type. 

let's take a example, a authentication api expecting get the following request data:

    {
      email: "sample@gmail.com",
     password: "my_password"
    }

you have two content type choices: `application/json` and `application/vnd.mycompany.credential+json`, if this is a public api, I'll chose the customized content type - `application/vnd.mycompany.credential+json`, or this is an internal api, I'll chose the standard content type - `application/json`. I made this choice by considering the following reasons:


|                               | Pros                                                                                                                                    | Cons                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Customized content type       | Could define a [json schema](http://json-schema.org/), api server and client could use this json schema ensure request is processable.  | adding complexity                                                              
| Standard content type         | Simple and straightforward                                                                                                              | no validation to request data, any unexpected message could be send to server  


#### Code conversion

I struggled with workflow management when I play the very first story in this project, the problem is, it is very common and business workflow have more then two exit points. e.g. a login workflow, the possiable exit points are:

1. username password matched, login succeed
2. username password mimatched, login failed
3. user is inactived, login failed
4. user is locked because of too many login failures, login failed.
5. …

in a rails project, it is very important to keep your controllers clean, controller's only responsibility is passing parameters and routating, so it is better is to put these business logic into **Model** or **Service**. here comes the problem: how can we let the controller konw the extact reason of failure without put the business logic in controller? return value can not fufill this requirement, so here come out our solution: modeling these exception exit point with ruby exception, handing different exceptions in controller with different exception handler. and we found it makes the controller and model much more cleaner. let's have a look at this example:


Before, the controller was messy:

      #in controller
      def create
        user = User.authorize(params[:email], params[:password])
        if user.nil?
          render :status => 401, :json => {:error => "Unauthorized"}
        elsif !user.activated?
          render :status => 403, :json => {:error => "user hasn't been activated"}
        else
          response.headers["Token"]= Session.generate_token(user)
          render :status => 201, :nothing => true
        end
      end

After, controller is much cleaner

      #in controller
      rescue_from InactiveUserException, with: :user_is_inactive
      rescue_from InvalidCredentialException, with: :invaild_credential
      rescue_from UserNotFoundException, with: :user_not_found

      def create
        login_session = User.login(params[:email], params[:password])
        response.headers["Token"]= login_session.token
        render :status => :created, :nothing => true
      end

#### Error code
It is very common to return failure reason when API call failed. Even we can return failure reason in plian english, as an API provider, we shouldn't assume that API client will use error message we provided, it's better to return a structured failure reason which can be *parsed* by API client. let's take a look at example from Github API:

    {
      "message": "Validation Failed",
        "errors": [
        {
          "resource": "Issue",
          "field": "title",
          "code": "missing_field"
        }
      ]
    }

failure reason was returned as an JSON object, `resource` representing what kind of resource is requested, `field` indicates which field fails api call, `code` indicating the exact faliure reason. 

Another thing I want to highlight is - **do not define numeric error code**, it will be a nightmare for you and your client. a better solution is define meanningful error code, like `missing_field`, `too_long`, etc.

#### Documentation
RESTful api don't have frontend, so it is very important to make your document friendly. Aslo, it is very common that a developer changing code but forgot to change api doc, so it would be great if we can generating api document automaticly. considering we have a well formed test suite(or spec) for the api, why cann't we just extract information from these tests/specs and generating document automaticly. Acturally there're some gems trying to solve this problem: [apipie-rails](https://github.com/Pajk/apipie-rails), [swagger-ui](https://github.com/wordnik/swagger-ui).
we're using apipie-rails, but we've found some missing features in apipie-rails. e.g. it can not record extract request and response headers, while headers play a important rule in a RESTful api.


#### Testing
We have two kind of tests in this project: integration test and unit test.

integration tests test the api from end point, it is a end to end test. we use [requesting rspec](https://github.com/rspec/rspec-rails#request-specs) define this test.  

unit tests test different layer. hints: only stub method on the boundary of each layer.


#### Versioning

we could specify api version in either url or http request header. In theory, verion number in url is not restful, any thoughts, please let me know

#### Deployment

We deploy our api on amazon [EC2](http://en.wikipedia.org/wiki/Amazon_Elastic_Compute_Cloud).

+ Provision:
  creating new node from a customized [AMI](http://en.wikipedia.org/wiki/Amazon_Machine_Image) (with many required dependence installed). 

+ Build pipeline:

  the CI will build a rpm package one all test passed, then this package will be pushed to [S3](http://en.wikipedia.org/wiki/Amazon_S3), after that, this package will be installed on the provisioned node.
