# Design Document

## Overview

This design implements automatic redirection to user profiles after successful login, replacing the current generic home page redirection. The solution modifies the authentication flow to construct and navigate to personalized profile URLs while maintaining robust error handling and fallback mechanisms.

## Architecture

The post-login redirection will be implemented through modifications to the existing authentication system components:

1. **Auth Store Enhancement**: Extend the login method to handle profile redirection
2. **Auth Layout Modification**: Update the auth layout to redirect to profile instead of home
3. **Utility Function**: Create a profile URL generator for consistent URL construction
4. **Error Handling**: Implement graceful fallbacks for edge cases

## Components and Interfaces

### 1. Profile URL Generator Utility

```typescript
// src/utils/profileUrl.ts
interface ProfileUrlParams {
  userId: string;
  userName: string;
}

function generateProfileUrl(params: ProfileUrlParams): string
```

**Purpose**: Centralized function to construct profile URLs consistently across the application.

**Implementation**: 
- Uses slugify to convert user names to URL-safe format
- Returns `/users/{userId}/{userSlug}` format
- Handles special characters and spaces in user names

### 2. Enhanced Auth Store

**Modifications to `src/store/Auth.ts`**:
- Add profile redirection logic to the login method
- Include error handling for redirection failures
- Maintain backward compatibility with existing functionality

**New Interface Addition**:
```typescript
interface IAuthStore {
  // ... existing properties
  redirectToProfile(): Promise<void>;
}
```

### 3. Updated Auth Layout

**Modifications to `src/app/(auth)/layout.tsx`**:
- Replace hardcoded "/" redirect with profile URL redirection
- Add error handling and fallback mechanisms
- Ensure user data is available before redirection

### 4. Router Integration

**Integration Points**:
- Use Next.js `useRouter` for navigation
- Implement client-side routing for immediate redirection
- Handle both initial login and session restoration scenarios

## Data Models

### User Profile URL Structure
```
/users/{userId}/{userSlug}
```

**Components**:
- `userId`: Unique user identifier from Appwrite
- `userSlug`: URL-safe version of user's display name

### Redirection Flow Data
```typescript
interface RedirectionContext {
  user: Models.User<UserPrefs>;
  targetUrl: string;
  fallbackUrl: string;
  timestamp: Date;
}
```

## Error Handling

### Primary Error Scenarios

1. **Missing User Data**
   - **Cause**: User object not available after login
   - **Handling**: Redirect to home page ("/")
   - **Logging**: Log warning with session details

2. **URL Construction Failure**
   - **Cause**: Invalid characters in user name or missing userId
   - **Handling**: Redirect to questions page ("/questions")
   - **Logging**: Log error with user data

3. **Navigation Failure**
   - **Cause**: Router push fails or network issues
   - **Handling**: Attempt fallback navigation to home
   - **Logging**: Log error with attempted URL

### Fallback Hierarchy
1. Primary: `/users/{userId}/{userSlug}` (Profile page)
2. Secondary: `/questions` (Questions listing)
3. Tertiary: `/` (Home page)

### Error Recovery
- All redirection errors are non-blocking
- User session remains intact regardless of redirection outcome
- Failed redirections are logged for monitoring
- Users can manually navigate to their profile via header navigation

## Testing Strategy

### Unit Tests
- Profile URL generation with various user name formats
- Auth store login method with mocked router
- Error handling scenarios with invalid data

### Integration Tests
- Complete login flow from form submission to profile page
- Session restoration with automatic profile redirection
- Fallback behavior when profile page is inaccessible

### Manual Testing Scenarios
1. **Standard Login Flow**
   - Login with valid credentials
   - Verify redirection to correct profile URL
   - Confirm profile page loads with user data

2. **Edge Case Testing**
   - Login with special characters in name
   - Test with very long user names
   - Verify behavior with missing user preferences

3. **Error Condition Testing**
   - Simulate network failures during redirection
   - Test with corrupted user data
   - Verify fallback navigation works correctly

### Performance Considerations
- Profile URL generation is O(1) operation
- Redirection occurs immediately after login success
- No additional API calls required for URL construction
- Minimal impact on existing authentication performance

## Implementation Notes

### Backward Compatibility
- Existing login functionality remains unchanged
- Current session management is preserved
- No breaking changes to auth store interface

### Security Considerations
- Profile URLs use existing user ID validation
- No sensitive data exposed in URL construction
- Maintains current authentication security model

### Accessibility
- Redirection provides clear navigation path for users
- Screen readers benefit from direct profile access
- Maintains keyboard navigation compatibility