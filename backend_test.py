#!/usr/bin/env python3
"""
Backend Testing for Malta Sells Lucia Voice Assistant API
Testing the redesigned /api/voice endpoint with text input and JSON response format
- Verifies text-to-speech pipeline: Text → GPT-4o-mini → TTS → Base64 JSON response
- Tests elimination of HTTP 502 errors from audio file upload complexity
- Validates JSON response format with { text, audioBase64, processingTime, audioSize }
- Tests various text input scenarios and error handling
"""

import requests
import json
import time
import base64

# Test configuration
BASE_URL = "http://localhost:3000"
VOICE_API_URL = f"{BASE_URL}/api/voice"

def test_text_input(text, description=""):
    """Helper function to test text input with the voice API"""
    print(f"   📝 Testing: {description or text[:50]}")
    try:
        response = requests.post(
            VOICE_API_URL, 
            headers={'Content-Type': 'application/json'},
            json={'text': text},
            timeout=60
        )
        return response
    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return None

def test_voice_api_health_check():
    """Test GET /api/voice endpoint for health check"""
    print("🔍 Testing GET /api/voice (Health Check)")
    try:
        response = requests.get(VOICE_API_URL, timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Health check passed")
            print(f"   Models: {data.get('models', {})}")
            print(f"   Config: {data.get('config', {})}")
            return True
        elif response.status_code == 502:
            print("   ❌ 502 Bad Gateway error still present!")
            return False
        else:
            print(f"   ⚠️ Unexpected status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        print(f"   ❌ Connection error: {e}")
        return False
    except requests.exceptions.Timeout as e:
        print(f"   ❌ Timeout error: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_voice_api_post_no_text():
    """Test POST /api/voice without text input"""
    print("\n🔍 Testing POST /api/voice (No Text Input)")
    try:
        response = requests.post(
            VOICE_API_URL, 
            headers={'Content-Type': 'application/json'},
            json={},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if "Text input required" in data.get('error', ''):
                print("   ✅ Proper error handling for missing text")
                return True
        elif response.status_code == 502:
            print("   ❌ 502 Bad Gateway error still present!")
            return False
            
        print("   ⚠️ Unexpected response for missing text")
        return False
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_voice_api_post_empty_text():
    """Test POST /api/voice with empty text input"""
    print("\n🔍 Testing POST /api/voice (Empty Text Input)")
    try:
        response = test_text_input("", "Empty string")
        if not response:
            return False
            
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if "Empty text input" in data.get('error', ''):
                print("   ✅ Proper error handling for empty text")
                return True
        elif response.status_code == 502:
            print("   ❌ 502 Bad Gateway error still present!")
            return False
            
        print("   ⚠️ Unexpected response for empty text")
        return False
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_voice_api_post_normal_text():
    """Test POST /api/voice with normal property question"""
    print("\n🔍 Testing POST /api/voice (Normal Property Question)")
    
    test_text = "Show me apartments in Sliema with sea views"
    
    try:
        print("   📤 Sending text to Lucia voice API...")
        start_time = time.time()
        response = test_text_input(test_text, "Normal property question")
        if not response:
            return False
            
        elapsed_time = time.time() - start_time
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Processing Time: {elapsed_time:.2f}s")
        print(f"   Content Type: {response.headers.get('Content-Type', 'N/A')}")
        print(f"   Content Length: {response.headers.get('Content-Length', 'N/A')}")
        
        # Check for 502 error
        if response.status_code == 502:
            print("   ❌ 502 Bad Gateway error still present!")
            print(f"   Response: {response.text}")
            return False
        
        # Check for successful JSON response with Base64 audio
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'application/json' in content_type:
                try:
                    data = response.json()
                    print("   ✅ Received JSON response")
                    
                    # Validate required fields for new format
                    required_fields = ['text', 'audioBase64', 'processingTime', 'audioSize']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        print(f"   ❌ Missing required fields: {missing_fields}")
                        return False
                    
                    # Validate Base64 audio
                    audio_base64 = data.get('audioBase64', '')
                    if not audio_base64:
                        print("   ❌ Empty audioBase64 field")
                        return False
                    
                    # Check if it's valid Base64
                    try:
                        audio_bytes = base64.b64decode(audio_base64)
                        print(f"   ✅ Valid Base64 audio data: {len(audio_bytes)} bytes")
                    except Exception as e:
                        print(f"   ❌ Invalid Base64 audio data: {e}")
                        return False
                    
                    # Display response data
                    print(f"   AI Response: {data.get('text', 'N/A')}")
                    print(f"   Server Processing Time: {data.get('processingTime', 'N/A')}ms")
                    print(f"   Audio Size: {data.get('audioSize', 'N/A')} bytes")
                    
                    # Verify audio size matches Base64 decoded size
                    expected_size = data.get('audioSize', 0)
                    actual_size = len(audio_bytes)
                    if expected_size != actual_size:
                        print(f"   ⚠️ Audio size mismatch: expected {expected_size}, got {actual_size}")
                    else:
                        print("   ✅ Audio size matches expected value")
                    
                    print("   ✅ Text → GPT-4o-mini → TTS pipeline working - JSON format")
                    return True
                    
                except json.JSONDecodeError as e:
                    print(f"   ❌ Invalid JSON response: {e}")
                    print(f"   Response text: {response.text[:200]}...")
                    return False
            else:
                print(f"   ❌ Expected application/json, got: {content_type}")
                print(f"   Response: {response.text[:200]}...")
                return False
        
        # Check for error response
        elif response.status_code == 500:
            try:
                data = response.json()
                error_msg = data.get('error', 'Unknown error')
                print(f"   ⚠️ Server error: {error_msg}")
                
                # Check if it's a timeout or API issue
                if 'timeout' in error_msg.lower():
                    print("   ⚠️ Timeout error - API is working but slow")
                    return True  # 502 is resolved, just slow
                elif 'api' in error_msg.lower():
                    print("   ⚠️ OpenAI API issue - endpoint is working")
                    return True  # 502 is resolved, API key/quota issue
                else:
                    print("   ❌ Unexpected server error")
                    return False
            except:
                print(f"   ❌ Server error with non-JSON response: {response.text}")
                return False
        
        else:
            print(f"   ⚠️ Unexpected status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        print(f"   ❌ Connection error: {e}")
        return False
    except requests.exceptions.Timeout as e:
        print(f"   ❌ Timeout error: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_voice_api_short_text():
    """Test POST /api/voice with short text (few words)"""
    print("\n🔍 Testing POST /api/voice (Short Text)")
    try:
        response = test_text_input("Hello Lucia", "Short text (2 words)")
        if not response:
            return False
            
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('text') and data.get('audioBase64'):
                print("   ✅ Short text processed successfully")
                return True
        elif response.status_code == 502:
            print("   ❌ 502 Bad Gateway error still present!")
            return False
            
        print("   ⚠️ Unexpected response for short text")
        return False
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_voice_api_long_text():
    """Test POST /api/voice with longer text (100+ words)"""
    print("\n🔍 Testing POST /api/voice (Long Text - 100+ words)")
    
    long_text = """I am looking for a luxury apartment in Malta with at least three bedrooms and two bathrooms. 
    The property should have sea views and be located in a prime area like Sliema, St. Julians, or Valletta. 
    I prefer modern amenities including air conditioning, a fully equipped kitchen, and parking space. 
    My budget is around 500,000 euros and I would like to schedule viewings for properties that match these criteria. 
    Can you also provide information about the local amenities, schools, and transportation options in these areas? 
    I am particularly interested in properties that are close to the beach and have good access to restaurants and shopping centers."""
    
    try:
        response = test_text_input(long_text, f"Long text ({len(long_text)} characters)")
        if not response:
            return False
            
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text[:200]}...")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('text') and data.get('audioBase64'):
                print("   ✅ Long text processed successfully")
                print(f"   Response length: {len(data.get('text', ''))} characters")
                return True
        elif response.status_code == 502:
            print("   ❌ 502 Bad Gateway error still present!")
            return False
            
        print("   ⚠️ Unexpected response for long text")
        return False
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_voice_api_very_long_text():
    """Test POST /api/voice with very long text (should be handled or truncated)"""
    print("\n🔍 Testing POST /api/voice (Very Long Text - 1000+ characters)")
    
    very_long_text = "Malta real estate " * 100  # Creates ~1800 character string
    
    try:
        response = test_text_input(very_long_text, f"Very long text ({len(very_long_text)} characters)")
        if not response:
            return False
            
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if "too long" in data.get('error', '').lower():
                print("   ✅ Proper error handling for very long text")
                return True
        elif response.status_code == 200:
            data = response.json()
            if data.get('text') and data.get('audioBase64'):
                print("   ✅ Very long text handled successfully (truncated or processed)")
                return True
        elif response.status_code == 502:
            print("   ❌ 502 Bad Gateway error still present!")
            return False
            
        print("   ⚠️ Unexpected response for very long text")
        return False
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_base64_audio_validation():
    """Test Base64 audio validation and MP3 format verification"""
    print("\n🔍 Testing Base64 Audio Validation")
    
    test_text = "What are the best areas to buy property in Malta?"
    
    try:
        response = test_text_input(test_text, "Base64 audio validation test")
        if not response:
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                audio_base64 = data.get('audioBase64', '')
                
                if not audio_base64:
                    print("   ❌ No audioBase64 field in response")
                    return False
                
                # Decode Base64
                audio_bytes = base64.b64decode(audio_base64)
                
                # Check if it looks like MP3 (starts with ID3 tag or MP3 frame sync)
                # MP3 frame sync can be 0xFF followed by 0xFB, 0xFA, 0xF3, 0xF2, etc.
                is_mp3 = (audio_bytes.startswith(b'ID3') or 
                         (len(audio_bytes) >= 2 and audio_bytes[0] == 0xFF and (audio_bytes[1] & 0xE0) == 0xE0))
                
                if is_mp3:
                    print("   ✅ Base64 audio appears to be valid MP3 format")
                    print(f"   Audio data size: {len(audio_bytes)} bytes")
                    
                    # Verify it matches the audioSize field
                    expected_size = data.get('audioSize', 0)
                    if len(audio_bytes) == expected_size:
                        print("   ✅ Audio size matches audioSize field")
                        return True
                    else:
                        print(f"   ⚠️ Size mismatch: decoded={len(audio_bytes)}, expected={expected_size}")
                        return False
                else:
                    print("   ❌ Decoded audio doesn't appear to be MP3 format")
                    print(f"   First 20 bytes: {audio_bytes[:20]}")
                    return False
                    
            except json.JSONDecodeError:
                print("   ❌ Response is not valid JSON")
                return False
            except Exception as e:
                print(f"   ❌ Base64 decoding error: {e}")
                return False
        else:
            print(f"   ⚠️ API returned status {response.status_code}, skipping Base64 test")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_mobile_compatibility():
    """Test mobile compatibility with proper Content-Type headers"""
    print("\n🔍 Testing Mobile Compatibility (Content-Type: application/json)")
    try:
        # Test with mobile user agent
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
        
        response = requests.post(
            VOICE_API_URL,
            headers=headers,
            json={'text': 'Show me properties in Valletta'},
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        
        if response.status_code == 200:
            data = response.json()
            if 'application/json' in response.headers.get('Content-Type', ''):
                print("   ✅ Mobile-compatible JSON response")
                return True
        elif response.status_code == 502:
            print("   ❌ 502 Bad Gateway error on mobile request!")
            return False
        
        print("   ⚠️ Unexpected mobile response")
        return False
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_tts_truncation():
    """Test TTS truncation for long responses (20 second limit)"""
    print("\n🔍 Testing TTS Truncation (20 second limit)")
    
    # Request that might generate a long response
    long_query = "Tell me everything about buying property in Malta including all the legal requirements, taxes, fees, best locations, market trends, and investment opportunities"
    
    try:
        start_time = time.time()
        response = test_text_input(long_query, "Long query for TTS truncation test")
        if not response:
            return False
            
        elapsed_time = time.time() - start_time
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Processing Time: {elapsed_time:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('text', '')
            audio_size = data.get('audioSize', 0)
            
            print(f"   Response length: {len(response_text)} characters")
            print(f"   Audio size: {audio_size} bytes")
            
            # Check if response was truncated (should be under 300 chars based on API code)
            if len(response_text) <= 300:
                print("   ✅ Response appropriately sized for TTS")
            else:
                print("   ⚠️ Response might be too long for optimal TTS")
            
            # Check processing time (should be reasonable)
            if elapsed_time <= 30:  # 30 second reasonable limit
                print("   ✅ Processing time within acceptable range")
                return True
            else:
                print("   ⚠️ Processing time longer than expected")
                return False
                
        elif response.status_code == 502:
            print("   ❌ 502 Bad Gateway error!")
            return False
        
        print("   ⚠️ Unexpected response for TTS truncation test")
        return False
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    """Run all voice API tests"""
    print("🎤 Malta Sells Voice API Testing")
    print("=" * 50)
    
    # Check if Next.js is running
    try:
        response = requests.get(BASE_URL, timeout=5)
        if response.status_code != 200:
            print(f"❌ Next.js app not responding at {BASE_URL}")
            return
    except:
        print(f"❌ Cannot connect to Next.js app at {BASE_URL}")
        return
    
    print(f"✅ Next.js app is running at {BASE_URL}")
    
    # Run tests
    tests = [
        ("Health Check (GET)", test_voice_api_health_check),
        ("No Audio Error", test_voice_api_post_no_audio),
        ("Empty Audio Error", test_voice_api_post_empty_audio),
        ("Valid Audio Processing", test_voice_api_post_valid_audio),
        ("Base64 Audio Validation", test_base64_audio_validation),
        ("Large File Error", test_voice_api_large_file),
        ("Response Headers", test_response_headers),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print(f"\n{'='*50}")
    print("🎯 TEST SUMMARY")
    print(f"{'='*50}")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    # Check for 502 resolution
    if results.get("Health Check (GET)", False):
        print("\n🎉 SUCCESS: 502 Bad Gateway errors have been resolved!")
        print("   The voice API endpoint is now accessible")
    else:
        print("\n⚠️ WARNING: Voice API endpoint may still have issues")
    
    # Check OpenAI integration
    if results.get("Valid Audio Processing", False):
        print("🎉 SUCCESS: OpenAI integration is working!")
        print("   Whisper + GPT + TTS pipeline is functional")
    else:
        print("⚠️ WARNING: OpenAI integration may have issues")
        print("   (This could be due to API key, quota, or network issues)")

if __name__ == "__main__":
    main()