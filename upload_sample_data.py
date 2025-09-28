import os
import uuid
import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set.")
    exit(1)

def get_supabase_client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def setup_categories(client: Client):
    categories = [
        {'slug': 'food', 'title': 'Food & Meals'},
        {'slug': 'clothing', 'title': 'Clothing & Apparel'},
        {'slug': 'shelter', 'title': 'Housing & Shelter'},
        {'slug': 'transportation', 'title': 'Transportation'},
        {'slug': 'healthcare', 'title': 'Healthcare'},
        {'slug': 'education', 'title': 'Education & Tutoring'},
        {'slug': 'supplies', 'title': 'General Supplies'}
    ]
    
    print("Setting up categories...")
    for category in categories:
        try:
            client.table("categories").upsert(category, on_conflict="slug").execute()
            print(f"✓ Added category: {category['title']}")
        except Exception as e:
            print(f"✗ Error adding category {category['title']}: {e}")

def create_auth_users(client: Client, user_profiles):
    created_user_ids = []
    
    print("Creating auth users...")
    for user_profile in user_profiles:
        try:
            auth_response = client.auth.admin.create_user({
                "email": user_profile['email'],
                "password": "temppassword123",  
                "email_confirm": False,
                "user_metadata": {
                    "display_name": user_profile['display_name']
                }
            })
            
            if hasattr(auth_response, 'user') and auth_response.user:
                user_id = auth_response.user.id
                created_user_ids.append(user_id)
                print(f"✓ Created auth user: {user_profile['email']} (ID: {user_id})")
                user_profile['id'] = user_id
            else:
                print(f"✗ Failed to create auth user: {user_profile['email']}")
                
        except Exception as e:
            print(f"✗ Error creating auth user {user_profile['email']}: {e}")
            print("  Note: This might be expected if using anon key instead of service role key")
            created_user_ids.append(user_profile['id'])
            
    return created_user_ids

def setup_users_and_profiles(client: Client):
    user_profiles = [
        {
            'id': str(uuid.uuid4()),
            'display_name': 'Sarah Johnson',
            'avatar_url': None,
            'phone': None,
            'roles': ['seeker'],
            'languages': ['English'],
            'skills': ['cooking', 'cleaning'],
            'radius_meters': 5000,
            'email': 'sarah.johnson@example.com'
        },
        {
            'id': str(uuid.uuid4()),
            'display_name': 'Mike Chen',
            'avatar_url': None,
            'phone': None,
            'roles': ['provider'],
            'languages': ['English'],
            'skills': ['tutoring', 'math', 'programming'],
            'radius_meters': 10000,
            'email': 'mike.chen@example.com'
        },
        {
            'id': str(uuid.uuid4()),
            'display_name': 'Lisa Rodriguez',
            'avatar_url': None,
            'phone': None,
            'roles': ['provider'],
            'skills': ['transportation', 'driving', 'delivery'],
            'languages': ['English'],
            'radius_meters': 15000,
            'email': 'lisa.rodriguez@example.com'
        },
        {
            'id': str(uuid.uuid4()),
            'display_name': 'David Kim',
            'avatar_url': None,
            'phone': None,
            'languages': ['English'],
            'roles': ['seeker'],
            'skills': ['manual_labor'],
            'radius_meters': 3000,
            'email': 'david.kim@example.com'
        }
    ]

    extra_profiles = [
        {
            'id': str(uuid.uuid4()),
            'display_name': 'Emily Davis',
            'avatar_url': None,
            'phone': None,
            'roles': ['seeker'],
            'languages': ['English', 'Spanish'],
            'skills': ['childcare', 'nursing'],
            'radius_meters': 7000,
            'email': 'emily.davis@example.com'
        },
        {
            'id': str(uuid.uuid4()),
            'display_name': 'Carlos Rivera',
            'avatar_url': None,
            'phone': None,
            'roles': ['provider'],
            'languages': ['Spanish', 'English'],
            'skills': ['mechanic', 'repairs'],
            'radius_meters': 12000,
            'email': 'carlos.rivera@example.com'
        }
    ]

    user_profiles.extend(extra_profiles)
    create_auth_users(client, extra_profiles)

    
    create_auth_users(client, user_profiles)
    
    created_profiles = []
    
    print("Setting up profiles...")
    for user_profile in user_profiles:
        try:
            profile_data = {
                'id': user_profile['id'],
                'display_name': user_profile['display_name'],
                'avatar_url': user_profile['avatar_url'],
                'phone': user_profile['phone'],
                'roles': user_profile['roles'],
                'languages': user_profile['languages'],
                'skills': user_profile['skills'],
                'radius_meters': user_profile['radius_meters']
            }
            
            try:
                profile_data['created_at'] = datetime.now(timezone.utc).isoformat()
                result = client.table('profiles').upsert(profile_data).execute()
            except Exception as e:
                if "created_at" in str(e):
                    print(f"  Note: 'created_at' column not found in profiles table, removing it...")
                    del profile_data['created_at']
                    result = client.table('profiles').upsert(profile_data).execute()
                else:
                    raise e
            
            created_profiles.append(profile_data)
            print(f"✓ Added profile: {user_profile['display_name']}")
            
        except Exception as e:
            print(f"✗ Error adding profile {user_profile['display_name']}: {e}")
            if "row-level security" in str(e).lower():
                print(f"  Hint: Disable RLS on profiles table or use service role key")
    
    return created_profiles

def setup_posts(client: Client, profiles):
    seeker_profiles = [p for p in profiles if 'seeker' in p['roles']]
    provider_profiles = [p for p in profiles if 'provider' in p['roles']]
    
    if not seeker_profiles or not provider_profiles:
        print("! No profiles available for creating posts")
        return
    
    posts = [
        {
            'id': str(uuid.uuid4()),
            'author_id': None,
            'categories': 'food',
            'title': 'Need groceries for family of 4',
            'description': 'Looking for fresh vegetables, bread, and milk. Family struggling financially.',
            'quantity': 1,
            'is_free': False, 
            'location_text': 'Downtown',
            'status': 'open'
        },
        {
            'id': str(uuid.uuid4()),
            'author_id': None,
            'categories': 'education',
            'title': 'Need math tutoring for high school student',
            'description': 'My son needs help with algebra and geometry. Available evenings.',
            'quantity': 1,
            'is_free': False,  
            'location_text': 'Midtown',
            'status': 'open'
        },
        {
            'id': str(uuid.uuid4()),
            'author_id': None,
            'categories': 'education',
            'title': 'Free math tutoring available',
            'description': 'Experienced tutor offering free math help for students.',
            'quantity': 1,
            'is_free': True,
            'location_text': 'Uptown',
            'status': 'open'
        },
        {
            'id': str(uuid.uuid4()),
            'author_id': None,
            'categories': 'transportation',
            'title': 'Free rides to medical appointments',
            'description': 'Volunteer driver available for medical appointments and grocery shopping.',
            'quantity': 1,
            'is_free': True,  
            'location_text': 'Downtown',
            'status': 'open'
        }
    ]
    
    print("Setting up posts...")
    for post in posts:
        try:
            try:
                post_with_timestamp = post.copy()
                post_with_timestamp['created_at'] = datetime.now(timezone.utc).isoformat()
                client.table('posts').upsert(post_with_timestamp).execute()
            except Exception as e:
                if "created_at" in str(e):
                    client.table('posts').upsert(post).execute()
                else:
                    raise e
                    
            print(f"✓ Added post: {post['title']}")
        except Exception as e:
            print(f"✗ Error adding post {post['title']}: {e}")
            if "row-level security" in str(e).lower():
                print(f"  Hint: Disable RLS on posts table or use service role key")

def setup_organizations(client: Client):
    organizations = [
        {
            'id': str(uuid.uuid4()),
            'display_name': 'Downtown Food Bank',
            'types': ['foodbank'],
            'skills': ['food_distribution', 'volunteer_coordination'],
            'radius_meters': 10000,
            'org_verified': True
        },
        {
            'id': str(uuid.uuid4()),
            'display_name': 'Hope Shelter',
            'types': ['shelter'],
            'skills': ['emergency_housing', 'counseling'],
            'radius_meters': 15000,
            'org_verified': True
        }
    ]
    
    print("Setting up organizations...")
    for org in organizations:
        try:
            # Try with created_at first, then without if it fails
            try:
                org_with_timestamp = org.copy()
                org_with_timestamp['created_at'] = datetime.now(timezone.utc).isoformat()
                client.table('organization').upsert(org_with_timestamp).execute()
            except Exception as e:
                if "created_at" in str(e):
                    client.table('organization').upsert(org).execute()
                else:
                    raise e
                    
            print(f"✓ Added organization: {org['display_name']}")
        except Exception as e:
            print(f"✗ Error adding organization {org['display_name']}: {e}")
            if "row-level security" in str(e).lower():
                print(f"  Hint: Disable RLS on organization table or use service role key")

def check_environment(client: Client):
    """Check if we're using the right key and provide guidance"""
    print("Checking environment...")
    
    # Check if we can access auth admin functions (service role key indicator)
    try:
        # This will fail with anon key
        client.auth.admin.list_users()
        print("✓ Using service role key - full functionality available")
        return True
    except Exception:
        print("! Using anon key - limited functionality")
        print("  For full setup, use service role key or temporarily disable RLS")
        return False

def main():
    print("=" * 60)
    print("Setting up sample data for Multi-Modal Agent System")
    print("=" * 60)
    
    client = get_supabase_client()
    
    is_service_role = check_environment(client)
    
    # setup_categories(client)
    profiles = setup_users_and_profiles(client)
    setup_posts(client, profiles)
    setup_organizations(client)

    print("\n" + "=" * 60)
    print("Sample data setup completed!")
    print("=" * 60)
    
 
if __name__ == "__main__":
    main()