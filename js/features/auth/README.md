# Auth Feature

This module provides the Authentication enterprise layer.

## Architecture
- **AuthRepository**: Located in `js/repositories/AuthRepository.js`. Wraps standard Firebase Authentication and handles JWT token evaluation.
- **AuthService**: Handles login business logic, e.g., falling back to custom tokens if email login fails (for course credentials).
- **AuthController**: Orchestrates Auth state across the UI and integrates with the `StateStore` and `EventBus`.
- **AuthUI**: Connects to DOM events for the various login entry gates (`#student-entry-form`, `#instructor-entry-form`, `#unified-entry-form`).

## Events Emitted
- `Events.AUTH_STATE_CHANGED`: Emitted on login/logout with the Firebase `user` object (or `null`).
- `Events.USER_PROFILE_LOADED`: Emitted when the user's role permissions have been parsed from their ID Token.
