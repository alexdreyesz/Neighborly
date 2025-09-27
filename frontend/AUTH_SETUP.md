# Authentication Setup

## Supabase Configuration

The Supabase client is configured in `src/config/supabaseClient.ts` with the following setup:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kqylkyofwhiohgttlgqb.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
```

## Environment Variables

Create a `.env` file in the frontend directory with:

```
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Authentication Pages

### Login Page (`/login`)
- Email and password authentication
- Form validation
- Error handling
- Link to sign up page

### Sign Up Page (`/signup`)
- Email and password registration
- Password confirmation
- Password length validation
- Email confirmation flow
- Link to login page

## File Organization

```
src/
├── config/
│   └── supabaseClient.ts
├── pages/
│   ├── Auth/
│   │   ├── index.ts
│   │   ├── Login.tsx
│   │   └── SignUp.tsx
│   └── index.ts
└── router/
    └── routes.tsx
```

## Styling

The authentication pages use the existing color scheme:
- Primary color: `#19513b` (green)
- Hover states and focus rings
- Consistent with the main application design
- Responsive design with Tailwind CSS

## Navigation

- Landing page buttons now link to the sign up page
- Auth pages include navigation back to home
- Cross-linking between login and sign up pages
