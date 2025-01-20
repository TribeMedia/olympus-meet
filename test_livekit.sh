#!/bin/bash

# Exit on error
set -e

# Check if environment variables are set
if [ -z "$LIVEKIT_API_KEY" ] || [ -z "$LIVEKIT_API_SECRET" ]; then
    echo "Error: LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set"
    exit 1
fi

# Install livekit CLI if not already installed
if ! command -v lk &> /dev/null; then
    echo "Installing livekit CLI..."
    curl -sSL https://get.livekit.io | bash
fi

# Create a test room
echo "Creating test room..."
ROOM_NAME="test-room-$(date +%s)"
lk room create "$ROOM_NAME" \
    --api-key="$LIVEKIT_API_KEY" \
    --api-secret="$LIVEKIT_API_SECRET" \
    --empty-timeout=60

echo "Room created successfully!"
