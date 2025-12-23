FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app

# Create directories for credentials (if using file-based credentials)
RUN mkdir -p /app/credentials

# Expose port (Railway will use $PORT env variable)
EXPOSE 8000

# Run the application with PORT variable from Railway
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

