# useProfile Hook

A React hook for fetching and managing user profile data from Supabase.

## Features

- Fetches both regular user profiles and organization profiles
- Handles loading and error states
- Provides update functions for profiles and organizations
- Automatically determines if user is an organization
- TypeScript support with proper type definitions

## Usage

### Basic Usage

```tsx
import { useProfile } from '../hooks/useProfile'

function MyComponent() {
  const { profile, loading, error, refetch, updateProfile, updateOrganization } = useProfile()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!profile) return <div>No profile found</div>

  return (
    <div>
      <h1>{profile.isOrganization ? 'Organization' : 'User'} Profile</h1>
      {profile.isOrganization ? (
        <div>
          <p>Name: {profile.organization?.display_name}</p>
          <p>Types: {profile.organization?.types?.join(', ')}</p>
        </div>
      ) : (
        <div>
          <p>Name: {profile.profile?.display_name}</p>
          <p>Roles: {profile.profile?.roles?.join(', ')}</p>
        </div>
      )}
    </div>
  )
}
```

### Standalone Function

```tsx
import { getProfile } from '../hooks/useProfile'

async function fetchUserProfile() {
  try {
    const profile = await getProfile()
    console.log('Profile:', profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}
```

### Updating Profile

```tsx
const { updateProfile } = useProfile()

const handleUpdate = async () => {
  try {
    await updateProfile({
      display_name: 'New Name',
      phone: '123-456-7890',
      skills: ['tutoring', 'driving']
    })
    console.log('Profile updated successfully')
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}
```

## API Reference

### useProfile Hook

Returns an object with:

- `profile`: UserProfile object containing profile and organization data
- `loading`: boolean indicating if data is being fetched
- `error`: string containing error message if any
- `refetch`: function to manually refetch profile data
- `updateProfile`: function to update regular user profile
- `updateOrganization`: function to update organization profile

### Types

```tsx
interface ProfileData {
  id: string
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  roles: string[]
  skills: string[]
  languages: string[]
  radius_meters: number
  org_verified: boolean
  created_at: string
}

interface OrganizationData {
  id: string
  display_name: string | null
  logo: string | null
  phone: string | null
  types: string[]
  skills: string[]
  languages: string[]
  radius_meters: number
  org_verified: boolean
  created_at: string
}

interface UserProfile {
  profile: ProfileData | null
  organization: OrganizationData | null
  isOrganization: boolean
}
```

## Database Schema

The hook works with the following Supabase tables:

- `profiles`: Regular user profiles
- `organization`: Organization profiles
- `auth.users`: Supabase auth users

Make sure your database has the proper RLS policies set up for these tables.
