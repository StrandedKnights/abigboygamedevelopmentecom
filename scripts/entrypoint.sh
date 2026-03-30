#!/bin/sh

# Automated Docker Secrets loader
# 1. Iterate through all files in /run/secrets/
# 2. Key name is the filename
# 3. Value is the file content
if [ -d "/run/secrets" ]; then
    for secret in /run/secrets/*; do
        if [ -f "$secret" ]; then
            secret_name=$(basename "$secret")
            echo "🔐 Loading Docker Secret: $secret_name"
            export "$secret_name"="$(cat "$secret")"
        fi
    done
fi

# Run the passed command (CMD from Dockerfile)
exec "$@"
