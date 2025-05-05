<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api', // Or just 'api' if you prefer /api/v1 etc. later
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        // Remove statefulApi() to make API routes stateless
        // This is appropriate for token-based authentication with Sanctum
        // and doesn't require CSRF protection
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
