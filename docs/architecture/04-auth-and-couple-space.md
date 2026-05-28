# Auth and Couple Space Architecture

## Auth Provider

Use Supabase Auth.

MVP supports:

- email/password auth, or
- magic link auth

The app should not allow access to timeline data until the user belongs to a couple space.

## App Entry Logic

On app start:

```txt
No session
  -> Auth screen

Session exists, no couple space
  -> Couple onboarding

Session exists, couple space exists
  -> Timeline
```

## Couple Space Flow

### Create Space

1. User signs in.
2. User taps "Create our space."
3. App creates `couple_spaces` row.
4. App creates `couple_members` row for current user.
5. App generates invite code.
6. User lands on timeline.

### Join Space

1. User signs in.
2. User enters invite code.
3. App validates invite code.
4. App creates `couple_members` row.
5. User lands on timeline.

## Constraints

- A user may belong to one couple space in MVP.
- A couple space should have max two active members in MVP.
- Invite code should be unique.
- Invite code can be regenerated later, but not required in MVP.

## Hooks

```ts
useSession()
useCurrentUser()
useCurrentCoupleSpace()
useCreateCoupleSpace()
useJoinCoupleSpace()
```
