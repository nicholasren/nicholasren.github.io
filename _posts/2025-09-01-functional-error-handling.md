---
layout: post
title: "Why you should try Functional Error Handling in Kotlin
"
comments: true
---
## Let's Talk About Errors (And Why They Drive Us Crazy)

If you've been coding for a while, you know that feeling. Your app is running smoothly in development, everything looks perfect, and then—BAM!—production throws you a curveball. An unexpected exception crashes your user's workflow, and you're left scrambling to figure out what went wrong.

I've been there more times than I'd like to admit. After years of wrestling with traditional error handling in Kotlin, I discovered something that completely changed how I think about errors: functional error handling. And honestly? It's been a game-changer.

## What's Wrong with Our Usual Approach?

Let's be real—most of us reach for exceptions and try-catch blocks because that's what we learned first. It's the "obvious" solution, right? But here's the thing: exceptions are like those surprise pop quizzes in school. They show up when you least expect them and often catch you completely off guard.

Here's what I mean:

- **They're sneaky**: Exceptions can pop up anywhere in your code, and good luck tracing where they came from when you're debugging at 2 AM
- **They're forgettable**: How many times have you forgotten to handle an exception, only to have your app crash in production?
- **They don't play nice with functional code**: Ever tried to chain operations cleanly when exceptions keep interrupting the flow?
- **They're expensive**: All that stack unwinding isn't free

Here's a typical piece of code I might have written a few years ago:

```kotlin
fun processUserData(userId: String): User {
    val user = userRepository.findById(userId) 
        ?: throw UserNotFoundException("User $userId not found")
    
    val profile = profileService.getProfile(user.id)
        ?: throw ProfileNotFoundException("Profile for user $userId not found")
    
    return User(user, profile)
}
```

It looks clean enough, but the caller has no idea what might go wrong just by looking at the function signature. They have to dig into the implementation or—worse—discover it the hard way in production.

## Enter the Heroes: Result and Either

This is where functional error handling comes to the rescue. Instead of hiding errors behind exceptions, we make them part of the conversation from the start.

### Result<T> - Your New Best Friend

Kotlin gives us `Result<T>` out of the box, and it's pretty clever:

```kotlin
sealed class Result<out T> {
    data class Success<T>(val value: T) : Result<T>()
    data class Failure(val exception: Throwable) : Result<T>()
}
```

It's simple: either you succeeded and got your value, or something went wrong and here's what happened.

### Either<L, R> - When You Want More Control

Sometimes you want to be more specific about your errors. That's where `Either` shines:

```kotlin
sealed class Either<out L, out R> {
    data class Left<L>(val value: L) : Either<L, Nothing>()
    data class Right<R>(val value: R) : Either<Nothing, R>()
    
    fun isLeft() = this is Left
    fun isRight() = this is Right
    
    fun getOrNull(): R? = when (this) {
        is Right -> value
        is Left -> null
    }
}
```

By convention, `Left` holds your errors and `Right` holds your success values. (There's actually a mnemonic here: "right" means "correct"!)

## Why This Approach Actually Works

### 1. **You Can't Ignore What's Right in Front of You**

When your function returns `Either<UserError, User>`, everyone knows exactly what they're dealing with:

```kotlin
sealed class UserError {
    data class NotFound(val userId: String) : UserError()
    data class InvalidData(val field: String, val reason: String) : UserError()
    data class ServiceUnavailable(val service: String) : UserError()
}

fun processUserData(userId: String): Either<UserError, User> {
    return when {
        userId.isBlank() -> Either.Left(UserError.InvalidData("userId", "Cannot be blank"))
        else -> {
            val user = userRepository.findById(userId)
            when {
                user == null -> Either.Left(UserError.NotFound(userId))
                else -> Either.Right(user)
            }
        }
    }
}
```

Now anyone calling this function knows they might get a `UserError`. No surprises, no hidden exceptions waiting to bite them.

### 2. **Chaining Operations Becomes Actually Pleasant**

Remember how frustrating it was to chain operations when exceptions kept getting in the way? Well, functional error handling makes this smooth as butter:

```kotlin
fun getUserWithProfile(userId: String): Either<UserError, UserWithProfile> {
    return processUserData(userId)
        .flatMap { user ->
            getProfile(user.id)
                .map { profile ->
                    UserWithProfile(user, profile)
                }
        }
}

// Either has a `flatMap` method that works with other functions with a Either return type.

fun <L, R, T> Either<L, R>.flatMap(f: (R) -> Either<L, T>): Either<L, T> = when (this) {
    is Either.Left -> Either.Left(value)
    is Either.Right -> f(value)
}
```

If any step fails, the error just flows through the chain naturally. No try-catch blocks, no nested exception handling—just clean, readable code.

### 3. **Error Handling That Actually Makes Sense**

Here's something I love: you can handle different types of errors differently, and it's all explicit:

```kotlin
fun handleUserRequest(userId: String): ApiResponse {
    return getUserWithProfile(userId)
        .fold(
            { error -> 
                when (error) {
                    is UserError.NotFound -> ApiResponse(404, "User not found")
                    is UserError.InvalidData -> ApiResponse(400, "Invalid data: ${error.reason}")
                    is UserError.ServiceUnavailable -> ApiResponse(503, "Service unavailable")
                }
            },
            { userWithProfile -> 
                ApiResponse(200, userWithProfile)
            }
        )
}
```

Each error type gets handled appropriately, and you can see exactly what's happening without diving into the implementation.

## How to Actually Make This Transition

I know what you're thinking: "This looks great, but how do I start using this in my existing codebase without rewriting everything?" Here's what worked for me:

### Step 1: Start Small and Safe

Pick one function that's been giving you headaches and try `Result<T>`:

```kotlin
fun safeDivide(a: Int, b: Int): Result<Int> {
    return if (b == 0) {
        Result.failure(IllegalArgumentException("Division by zero"))
    } else {
        Result.success(a / b)
    }
}

// Using it feels natural
val result = safeDivide(10, 2)
    .onSuccess { println("Result: $it") }
    .onFailure { println("Error: ${it.message}") }
```

### Step 2: Think About Your Business Errors

Don't just model technical failures—think about what actually matters to your business:

```kotlin
sealed class OrderError {
    data class InsufficientStock(val productId: String, val requested: Int, val available: Int) : OrderError()
    data class InvalidQuantity(val quantity: Int) : OrderError()
    data class PaymentFailed(val reason: String) : OrderError()
    data class UserNotAuthenticated(val userId: String) : OrderError()
}

fun createOrder(userId: String, productId: String, quantity: Int): Either<OrderError, Order> {
    return validateUser(userId)
        .flatMap { user -> validateQuantity(quantity) }
        .flatMap { qty -> checkStock(productId, qty) }
        .flatMap { stock -> processPayment(userId, productId, quantity) }
        .map { payment -> Order(userId, productId, quantity, payment.id) }
}
```

### Step 3: Make Your Code Sing with Extensions

Trust me, these little helper functions will make your life so much easier:

```kotlin
fun <L, R> Either<L, R>.getOrElse(default: R): R = when (this) {
    is Either.Left -> default
    is Either.Right -> value
}

fun <L, R> Either<L, R>.orElse(f: () -> Either<L, R>): Either<L, R> = when (this) {
    is Either.Left -> f()
    is Either.Right -> this
}

fun <L, R, T> Either<L, R>.map(f: (R) -> T): Either<L, T> = when (this) {
    is Either.Left -> Either.Left(value)
    is Either.Right -> Either.Right(f(value))
}
```

### Step 4: Play Nice with Kotlin's Cool Features

Don't forget that this approach works beautifully with coroutines and collections:

```kotlin
fun processUsers(userIds: List<String>): List<Either<UserError, User>> {
    return userIds.map { processUserData(it) }
}

fun processUsersWithCoroutines(userIds: List<String>): List<Either<UserError, User>> = runBlocking {
    userIds.map { userId ->
        async { processUserData(userId) }
    }.awaitAll()
}
```

### Step 5: Build Some Handy Tools

Over time, you'll find patterns that repeat. Build some utilities to make life easier:

```kotlin
object ErrorHandlers {
    fun <T> logAndReturnDefault(error: Throwable, default: T): T {
        logger.error("Operation failed, returning default", error)
        return default
    }
    
    fun <T> retry(attempts: Int, operation: () -> T): T {
        repeat(attempts - 1) { attempt ->
            try {
                return operation()
            } catch (e: Exception) {
                logger.warn("Attempt ${attempt + 1} failed", e)
            }
        }
        return operation() // Last attempt, let it throw if it fails
    }
}
```

## How to Actually Do This Without Breaking Everything

I learned this the hard way: don't try to convert your entire codebase overnight. Here's a sane approach:

**Step 1: Scout the Territory**
Look for those functions that are already causing you pain. You know the ones—they throw exceptions left and right, and you're constantly wrapping them in try-catch blocks.

**Step 2: Define Your Errors**
Create sealed classes for the errors that actually matter to your business. Don't get caught up in modeling every possible technical failure—focus on what your users and business logic care about.

**Step 3: Start Converting**
Pick one function at a time. Convert it, update its tests, and see how it feels. Don't break existing callers yet—just get comfortable with the new approach.

**Step 4: Update the World**
Start updating the places that call your newly converted functions. Replace those try-catch blocks with functional error handling. This is where you'll really start to see the benefits.

## Don't Fall Into These Traps

### Trap 1: Error Type Overload

I used to create error types for everything. Don't do this:

```kotlin
// I used to do this (don't copy me):
sealed class PaymentError {
    data class NetworkTimeout(val duration: Duration) : PaymentError()
    data class DatabaseConnectionFailed(val host: String) : PaymentError()
    data class JsonParsingError(val json: String) : PaymentError()
    // ... and 15 more technical errors nobody cares about
}

// Do this instead:
sealed class PaymentError {
    data class InsufficientFunds(val amount: BigDecimal) : PaymentError()
    data class CardExpired(val expiryDate: LocalDate) : PaymentError()
    object ServiceUnavailable : PaymentError()
}
```

Focus on errors that your business logic needs to handle differently.

### Trap 2: Forgetting to Handle Errors in Chains

This one bit me more than once:

```kotlin
// Don't do this - error types don't match!
fun processOrder(orderId: String): Either<OrderError, OrderConfirmation> {
    return validateOrder(orderId)
        .flatMap { order -> processPayment(order) } // Returns PaymentError, not OrderError!
        .map { payment -> OrderConfirmation(orderId, payment) }
}

// Do this instead:
fun processOrder(orderId: String): Either<OrderError, OrderConfirmation> {
    return validateOrder(orderId)
        .flatMap { order -> 
            processPayment(order)
                .mapLeft { PaymentError.toOrderError(it) } // Convert the error type
        }
        .map { payment -> OrderConfirmation(orderId, payment) }
}
```

### Trap 3: Forgetting About Recovery

Sometimes you can actually do something about an error:

```kotlin
fun getUserProfile(userId: String): Either<UserError, UserProfile> {
    return userRepository.findById(userId)
        .map { user -> UserProfile(user) }
        .orElse { 
            // Maybe we can create a default profile?
            logger.info("User $userId not found, creating default profile")
            Either.Right(UserProfile.createDefault(userId))
        }
}
```

## Why I Think You Should Try This

Look, I'm not going to lie—there's a learning curve here. The first time you see `Either<UserError, User>` instead of just `User`, it feels weird. But once you get used to it, going back to exception-based error handling feels like trying to debug with a blindfold on.

The real magic happens when you realize that errors aren't exceptional anymore—they're just another part of your data flow. You can reason about them, compose them, and handle them just like any other value in your system.

I've been using this approach for about two years now, and I can honestly say my applications are more reliable, my debugging sessions are shorter, and my sleep is better. When something goes wrong, I know exactly where to look and what might have caused it.

Functional error handling isn't about eliminating errors—that's impossible. It's about making them visible, manageable, and predictable. It's about turning those 3 AM debugging sessions into "Oh, I see exactly what happened here" moments.

## Ready to Give It a Shot?

Start small. Pick one function that's been causing you headaches and try converting it to use `Result<T>`. See how it feels. Play around with the composition. Get comfortable with the idea that errors are just data.

I promise you, once you start thinking about errors this way, you'll wonder how you ever managed without it. Your future self (and anyone who has to maintain your code) will definitely thank you.

And hey, if you run into issues or want to share your experience, I'd love to hear about it. We're all in this journey together, trying to write better, more reliable code one function at a time.
