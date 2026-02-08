import requests
import sys
import json
from datetime import datetime, timedelta

class SocialAutopilotAPITester:
    def __init__(self, base_url="https://social-autopilot-53.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_detail = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail += f" - {response.json()}"
                except:
                    error_detail += f" - {response.text}"
                self.log_test(name, False, error_detail)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_signup(self):
        """Test user signup"""
        timestamp = datetime.now().strftime('%H%M%S')
        signup_data = {
            "email": f"test_user_{timestamp}@example.com",
            "username": f"testuser_{timestamp}",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data=signup_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        # First create a user
        timestamp = datetime.now().strftime('%H%M%S')
        signup_data = {
            "email": f"login_test_{timestamp}@example.com",
            "username": f"loginuser_{timestamp}",
            "password": "LoginPass123!"
        }
        
        # Create user first
        success, _ = self.run_test(
            "Create User for Login Test",
            "POST",
            "auth/signup",
            200,
            data=signup_data
        )
        
        if not success:
            return False
            
        # Now test login
        login_data = {
            "email": signup_data["email"],
            "password": signup_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        return success and 'token' in response

    def test_drive_connect(self):
        """Test Google Drive connection endpoint"""
        success, response = self.run_test(
            "Google Drive Connect",
            "GET",
            "drive/connect",
            200
        )
        
        if success and 'authorization_url' in response:
            print(f"   OAuth URL generated: {response['authorization_url'][:50]}...")
            return True
        return False

    def test_youtube_connect(self):
        """Test YouTube connection endpoint"""
        success, response = self.run_test(
            "YouTube Connect",
            "GET",
            "youtube/connect",
            200
        )
        
        if success and 'authorization_url' in response:
            print(f"   YouTube OAuth URL generated: {response['authorization_url'][:50]}...")
            return True
        return False

    def test_schedule_post(self):
        """Test post scheduling"""
        # Schedule a post for 1 hour from now
        future_time = (datetime.now() + timedelta(hours=1)).isoformat() + 'Z'
        
        post_data = {
            "title": "Test Post",
            "caption": "This is a test post for automated scheduling",
            "platforms": ["instagram", "twitter"],
            "scheduled_time": future_time,
            "drive_file_ids": ["test_file_id_1", "test_file_id_2"]
        }
        
        success, response = self.run_test(
            "Schedule Post",
            "POST",
            "posts/schedule",
            200,
            data=post_data
        )
        
        if success and 'post_id' in response:
            self.scheduled_post_id = response['post_id']
            print(f"   Post scheduled with ID: {self.scheduled_post_id}")
            return True
        return False

    def test_get_scheduled_posts(self):
        """Test retrieving scheduled posts"""
        success, response = self.run_test(
            "Get Scheduled Posts",
            "GET",
            "posts/scheduled",
            200
        )
        
        if success and 'posts' in response:
            posts_count = len(response['posts'])
            print(f"   Found {posts_count} scheduled posts")
            return True
        return False

    def test_delete_post(self):
        """Test deleting a scheduled post"""
        if not hasattr(self, 'scheduled_post_id'):
            print("   Skipping delete test - no post ID available")
            return True
            
        success, response = self.run_test(
            "Delete Scheduled Post",
            "DELETE",
            f"posts/{self.scheduled_post_id}",
            200
        )
        
        return success

    def test_unauthorized_access(self):
        """Test endpoints without authentication"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "posts/scheduled",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Social Autopilot API Tests")
        print("=" * 50)
        
        # Test authentication
        if not self.test_signup():
            print("❌ Signup failed - stopping tests")
            return False
            
        if not self.test_login():
            print("❌ Login test failed")
            
        # Test Google Drive connection (will fail without credentials but should return proper error)
        self.test_drive_connect()
        
        # Test YouTube connection
        self.test_youtube_connect()
        
        # Test post operations
        if self.test_schedule_post():
            self.test_get_scheduled_posts()
            self.test_delete_post()
        
        # Test security
        self.test_unauthorized_access()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            return False

def main():
    tester = SocialAutopilotAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())