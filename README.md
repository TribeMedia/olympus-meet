# Olympus Meet

A modern video conferencing application built with Next.js 14, LiveKit, and AT Protocol integration. This project implements a feature-based architecture with strict TypeScript typing and comprehensive testing.

## Features

- 🎥 Video Conference (LiveKit integration)
- 💬 Real-time Chat
- 🔐 Authentication
- ⚙️ Device Settings
- 🤝 AT Protocol Integration

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Zustand (State Management)
- shadcn/ui (UI Components)
- LiveKit (WebRTC)
- AT Protocol

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- pnpm (package manager)

## Getting Started

### Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.sample .env.local
   ```

2. Configure your environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_LIVEKIT_URL=your_livekit_url
   LIVEKIT_API_KEY=your_api_key
   LIVEKIT_API_SECRET=your_api_secret
   ```

### Running with Docker

1. Build and start all services:
   ```bash
   docker-compose up --build
   ```

2. Access the application at `http://localhost:3000`

### AT Protocol Services

The project includes several AT Protocol services:

- **PDS (Personal Data Server)**: Handles user data storage and authentication
  - Port: 2583
  - Purpose: Core server for AT Protocol functionality

- **AppView**: Provides a read-only cache of PDS data
  - Port: 3001
  - Purpose: Optimizes data access and reduces load on PDS

- **BGS (Big Graph Service)**: Manages social graph operations
  - Port: 2584
  - Purpose: Handles follower/following relationships

- **Search Service**: Provides search functionality
  - Purpose: Enables content discovery within the AT Protocol network

### Development

#### Local Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

#### Docker Development

Build the Docker image:
```bash
docker build -t olympus-meet .
```

### Debugging

#### VSCode Debugging

1. Install the Docker extension for VSCode
2. Add the following configuration to `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Docker: Attach to Node",
         "type": "node",
         "request": "attach",
         "port": 9229,
         "address": "localhost",
         "localRoot": "${workspaceFolder}",
         "remoteRoot": "/app",
         "protocol": "inspector"
       }
     ]
   }
   ```

#### Windsurf/Cursor Debugging

1. Enable the Docker integration in your IDE
2. Use the built-in Docker container attachment feature
3. Set breakpoints directly in your code
4. Access container logs through the Docker extension

### Project Structure

```
.
├── app/                 # Next.js app directory
├── components/         # Feature-based components
│   ├── video-conference/
│   ├── chat/
│   ├── auth/
│   └── device-settings/
├── lib/                # Shared utilities
├── store/             # Zustand state management
└── docs/              # Project documentation
```

### Testing

Run the test suite:
```bash
pnpm test
```

Coverage requirements: 80% threshold

## Contributing

1. Follow the feature-based architecture
2. Ensure TypeScript strict mode compliance
3. Write tests for new features
4. Document components and store changes

## License

[MIT License](LICENSE)