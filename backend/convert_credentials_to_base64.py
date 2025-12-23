"""
Helper script to convert Gmail credentials to base64 for Railway deployment.
Run this locally, then copy the base64 strings to Railway environment variables.
"""

import base64
import json
import os

def convert_file_to_base64(filepath):
    """Convert a JSON file to base64 string"""
    if not os.path.exists(filepath):
        print(f"[X] File not found: {filepath}")
        return None
    
    try:
        with open(filepath, 'rb') as f:
            file_bytes = f.read()
        
        base64_string = base64.b64encode(file_bytes).decode('utf-8')
        return base64_string
    except Exception as e:
        print(f"[X] Error converting {filepath}: {e}")
        return None

def main():
    print("=" * 60)
    print("Gmail Credentials to Base64 Converter")
    print("=" * 60)
    print()
    
    # Convert credentials.json
    print("1. Converting credentials.json...")
    creds_base64 = convert_file_to_base64("credentials.json")
    if creds_base64:
        print(f"[OK] Success! Length: {len(creds_base64)} characters")
        with open("credentials_base64.txt", "w") as f:
            f.write(creds_base64)
        print("[OK] Saved to: credentials_base64.txt")
    print()
    
    # Convert token.json
    print("2. Converting token.json...")
    token_base64 = convert_file_to_base64("token.json")
    if token_base64:
        print(f"[OK] Success! Length: {len(token_base64)} characters")
        with open("token_base64.txt", "w") as f:
            f.write(token_base64)
        print("[OK] Saved to: token_base64.txt")
    print()
    
    print("=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print()
    print("1. Go to Railway Dashboard → Your Backend Service → Variables")
    print()
    print("2. Add these environment variables:")
    print()
    if creds_base64:
        print("   Variable Name: GMAIL_CREDENTIALS_BASE64")
        print(f"   Value: {creds_base64[:50]}...")
        print()
    if token_base64:
        print("   Variable Name: GMAIL_TOKEN_BASE64")
        print(f"   Value: {token_base64[:50]}...")
        print()
    print("3. Redeploy your Railway service")
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()

