# -------------------------
# STEP 1: Build React App
# -------------------------
FROM node:18 AS build-frontend
WORKDIR /client
COPY client/package*.json ./
RUN npm install
COPY client .
RUN npm run build


# -------------------------
# STEP 2: Build Flask App
# -------------------------
FROM python:3.10-slim

# Install nginx
RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend .

# Copy frontend build to Nginx HTML folder
COPY --from=build-frontend /client/dist /var/www/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/sites-enabled/default

# Expose API + UI
EXPOSE 80

# Run both Nginx + Flask using Supervisor
CMD ["sh", "-c", "service nginx start && gunicorn -b 0.0.0.0:5000 app:app"]
