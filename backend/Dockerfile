# Use a lightweight official Python runtime base image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager inside the container for faster builds
RUN pip install uv

# Copy package management definitions first to leverage Docker layer caching
COPY pyproject.toml uv.lock* ./

# Synchronize project dependencies using uv
RUN uv pip install --system -r pyproject.toml

# Copy the rest of the backend application code into the image
COPY . .

# Expose the specific port FastAPI listens on
EXPOSE 8000

# Set the production command to launch the Uvicorn ASGI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
