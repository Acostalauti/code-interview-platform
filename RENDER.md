# Deploying to Render

This project is configured for easy deployment on [Render](https://render.com).

## Option 1: Blueprints (Recommended)

1.  Create a new **Blueprint Instance** on Render.
2.  Connect your GitHub repository.
3.  Render will automatically detect `render.yaml` and configure the service.
4.  Click **Apply**.

## Option 2: Manual Deployment

1.  Create a new **Web Service** on Render.
2.  Connect your GitHub repository.
3.  **Runtime**: Select **Docker**.
4.  **Region**: Choose the one closest to you.
5.  **Branch**: `main` (or your default branch).
6.  **Plan**: Free (or as needed).
7.  Click **Create Web Service**.

## Configuration

- **Port**: Render automatically assigns a `PORT` environment variable. The `start.sh` script ensures Nginx listens on this port.
- **Health Check**: The service is configured to health check on `/`.
