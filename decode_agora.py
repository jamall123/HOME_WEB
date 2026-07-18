import base64
import sys

token = sys.argv[1]
# The token has a header and then base64 encoded data.
# The App ID might be visible in the decoded string.
decoded = base64.b64decode(token[4:] + '==').decode('utf-8', errors='ignore')
print("Decoded snippet:", decoded[:50])

