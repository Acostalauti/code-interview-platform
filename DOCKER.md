# Docker Deployment Guide

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Using Docker CLI

```bash
# Build the image
docker build -t code-interview-platform .

# Run the container
docker run -d -p 80:80 --name interview-platform code-interview-platform

# View logs
docker logs -f interview-platform

# Stop the container
docker stop interview-platform
docker rm interview-platform
```

## Access the Application

Once the container is running:

- **Frontend**: http://localhost
- **API**: http://localhost/api/sessions
- **WebSocket**: ws://localhost/socket.io

## Architecture

The Docker container includes:

- **nginx**: Serves static frontend files and proxies API/WebSocket requests
- **Node.js**: Runs the Express backend with Socket.io
- **Supervisor**: Manages both nginx and Node.js processes

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Backend server port (internal) |

## Build Arguments

None required. The Dockerfile uses multi-stage builds to optimize image size.

## Image Details

- **Base Image**: `node:20-alpine`
- **Estimated Size**: ~150-200 MB
- **Exposed Port**: 80
- **Health Check**: Included (checks every 30s)

## Production Deployment

### Deploy to Cloud Platforms

#### AWS ECS/Fargate

```bash
# Tag the image
docker tag code-interview-platform:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/code-interview-platform:latest

# Push to ECR
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/code-interview-platform:latest
```

#### Google Cloud Run

```bash
# Tag the image
docker tag code-interview-platform:latest gcr.io/<project-id>/code-interview-platform:latest

# Push to GCR
docker push gcr.io/<project-id>/code-interview-platform:latest

# Deploy
gcloud run deploy code-interview-platform \
  --image gcr.io/<project-id>/code-interview-platform:latest \
  --platform managed \
  --port 80
```

#### Heroku

```bash
# Login to Heroku Container Registry
heroku container:login

# Tag and push
docker tag code-interview-platform:latest registry.heroku.com/<app-name>/web
docker push registry.heroku.com/<app-name>/web

# Release
heroku container:release web -a <app-name>
```

## Troubleshooting

### Container won't start

Check logs:
```bash
docker logs interview-platform
```

### Port already in use

Change the port mapping:
```bash
docker run -d -p 8080:80 code-interview-platform
```

### Build fails

Clear Docker cache and rebuild:
```bash
docker build --no-cache -t code-interview-platform .
```

### WebSocket connection issues

Ensure your reverse proxy/load balancer supports WebSocket upgrades.

## Development vs Production

This Dockerfile is optimized for **production**. For development:

```bash
# Use the dev server instead
npm run dev
```

## Security Notes

- Container runs as non-root user (`node`)
- Only production dependencies included
- Health checks enabled
- No sensitive data in image

## Performance Optimization

The image is optimized with:
- Multi-stage builds (smaller final image)
- Alpine Linux base (minimal footprint)
- Production dependencies only
- Gzip compression enabled
- Static asset caching

## Monitoring

Health check endpoint:
```bash
curl http://localhost/
```

Container stats:
```bash
docker stats interview-platform
```
