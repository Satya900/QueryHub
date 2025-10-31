# Implementation Plan

- [x] 1. Create profile URL utility function
  - Create `src/utils/profileUrl.ts` with `generateProfileUrl` function
  - Implement URL construction using userId and slugified user name
  - Handle edge cases for special characters and empty names
  - _Requirements: 1.2, 1.3, 2.1_

- [ ] 2. Update authentication store with profile redirection
  - [x] 2.1 Add profile redirection method to auth store interface
    - Extend `IAuthStore` interface with `redirectToProfile` method
    - Import necessary dependencies (useRouter, profileUrl utility)
    - _Requirements: 1.1, 1.3_

  - [x] 2.2 Implement profile redirection logic in login method
    - Modify existing login function to call profile redirection after successful auth
    - Add error handling for redirection failures with fallback navigation
    - Ensure user data is fully loaded before attempting redirection
    - _Requirements: 1.1, 1.4, 2.2, 2.3_

  - [ ] 2.3 Write unit tests for auth store redirection logic

    - Test successful profile redirection with valid user data
    - Test fallback behavior when user data is missing or invalid
    - Mock router and verify correct navigation calls
    - _Requirements: 1.1, 2.1, 2.2_

- [ ] 3. Update auth layout component for profile redirection
  - [x] 3.1 Modify auth layout to use profile redirection
    - Replace hardcoded "/" redirect with profile URL construction
    - Import and use the profile URL utility function
    - Add error handling for URL construction failures
    - _Requirements: 1.1, 1.3, 1.5_

  - [x] 3.2 Implement fallback navigation hierarchy
    - Add secondary fallback to questions page ("/questions")
    - Add tertiary fallback to home page ("/")
    - Include error logging for failed redirection attempts
    - _Requirements: 2.1, 2.2, 2.4_

  - [ ] 3.3 Write integration tests for auth layout redirection

    - Test complete login flow from auth layout to profile page
    - Test session restoration with automatic profile redirection
    - Verify fallback behavior when profile page is inaccessible
    - _Requirements: 1.1, 1.5, 2.4_

- [ ] 4. Enhance social login redirection consistency
  - [ ] 4.1 Update Google login handler to use profile redirection
    - Modify Google OAuth callback to redirect to profile page
    - Ensure user data is available before redirection attempt
    - Apply same error handling and fallback logic
    - _Requirements: 3.1, 3.2, 3.4_

  - [ ] 4.2 Update GitHub login handler to use profile redirection
    - Modify GitHub OAuth callback to redirect to profile page
    - Ensure consistent behavior with email/password login
    - Apply same error handling and fallback logic
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ]* 4.3 Write tests for social login redirection consistency
    - Test Google login redirection to profile page
    - Test GitHub login redirection to profile page
    - Verify consistent behavior across all login methods
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 5. Add error logging and monitoring
  - [ ] 5.1 Implement redirection error logging
    - Add console logging for failed profile URL construction
    - Log navigation failures with attempted URLs
    - Include user context in error logs for debugging
    - _Requirements: 2.2, 2.3_

  - [ ] 5.2 Add performance monitoring for redirection timing
    - Track redirection completion time from login success
    - Ensure redirection meets 3-second requirement
    - Log slow redirections for performance optimization
    - _Requirements: 1.4_

- [ ] 6. Update existing navigation components for consistency
  - [x] 6.1 Verify header profile link uses same URL construction
    - Ensure Header component uses the same profileUrl utility
    - Update import statements to use centralized utility
    - Maintain consistent profile URL format across app
    - _Requirements: 1.2, 1.3_

  - [x] 6.2 Update any hardcoded profile links to use utility
    - Search for hardcoded `/users/` links in components
    - Replace with profileUrl utility function calls
    - Ensure consistent URL construction throughout application
    - _Requirements: 1.2, 1.3_
