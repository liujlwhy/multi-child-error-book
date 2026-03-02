# Docker Essentials

Essential Docker commands and workflows for container development, debugging, and deployment.

## When to Use This Skill

Use this skill when:
- Building, running, or managing Docker containers
- Debugging container issues
- Setting up development environments with Docker
- Deploying applications with Docker Compose
- Managing Docker images and volumes

## Commands

### Basic Container Operations
```bash
# Build and run a container
docker build -t myapp .
docker run -d --name myapp-container myapp

# Debug running containers
docker logs myapp-container
docker exec -it myapp-container /bin/bash

# Manage containers
docker ps
docker stop myapp-container
docker rm myapp-container
```

### Docker Compose
```bash
# Start services
docker-compose up -d
docker-compose logs

# Stop and clean up
docker-compose down
docker-compose down --volumes
```

### Image Management
```bash
# List and clean images
docker images
docker rmi old-image

# Build with specific context
docker build -f Dockerfile.dev -t myapp:dev .
```

## Best Practices

- Always use `.dockerignore` to exclude unnecessary files
- Use multi-stage builds for production images
- Run containers as non-root users when possible
- Use environment variables for configuration
- Keep containers stateless when possible

## Integration with OpenClaw

This skill integrates with OpenClaw's exec tool to run Docker commands safely. It will automatically handle common Docker scenarios and provide helpful suggestions for optimization.