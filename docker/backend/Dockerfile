FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements/base.txt /app/requirements/base.txt
COPY backend/requirements/development.txt /app/requirements/development.txt
RUN pip install --upgrade pip
RUN pip install -r requirements/development.txt

# Copy entrypoint script first
COPY docker/backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Copy project
COPY backend /app

# Run entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
