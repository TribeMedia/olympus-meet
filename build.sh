#!/bin/bash

docker buildx build -t tribehealth/olympus-meet-universal:latest.1 --platform linux/amd64,linux/arm64 --push .