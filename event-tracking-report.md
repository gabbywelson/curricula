# Event tracking report

This document lists all PostHog events that have been automatically added to your Next.js application.

## Events by File

### src/app/admin/AdminDashboard.tsx

- **admin_signed_out**: An admin user clicks the 'Sign out' button in the admin dashboard header.

### src/app/admin/login/page.tsx

- **admin-login-failed**: Fired when an admin user's sign-in attempt fails due to invalid credentials or an unexpected error.
- **admin-login-success**: Fired when an admin user successfully signs in.

### src/components/FilterPills.tsx

- **filter_pill_clicked**: Fired when a user clicks on a filter pill to change the active filter.

### src/components/Header.tsx

- **header_nav_link_clicked**: User clicks a navigation link ('Browse' or 'About') in the header.
- **header_cta_clicked**: User clicks the main 'Explore All' call-to-action button in the header.

### src/components/ResourceCard.tsx

- **resource_card_clicked**: Fired when a user clicks on a resource card to view its details.

### src/lib/auth-client.ts

- **user-signed-in**: Fired when a user initiates the sign-in process. Captures the authentication provider if available.
- **user-signed-out**: Fired when a user initiates the sign-out process.


## Events still awaiting implementation
- (human: you can fill these in)
---

## Next Steps

1. Review the changes made to your files
2. Test that events are being captured correctly
3. Create insights and dashboards in PostHog
4. Make a list of events we missed above. Knock them out yourself, or give this file to an agent.

Learn more about what to measure with PostHog and why: https://posthog.com/docs/new-to-posthog/getting-hogpilled
