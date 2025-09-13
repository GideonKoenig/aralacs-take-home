#!/usr/bin/env bash
# Use this script to start docker containers for the local development databases

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`
# Beware, this was never tested on macOS

# import env variables from .env
set -a
source .env

# Normalize potential CRLF to LF in env values
POSTGRES_DATABASE_URL=$(echo "$POSTGRES_DATABASE_URL" | tr -d '\r')
GREMLIN_DATABASE_URL=$(echo "$GREMLIN_DATABASE_URL" | tr -d '\r')

PG_DB_PASSWORD=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
PG_DB_PORT=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $4}' | awk -F'/' '{print $1}')
PG_DB_NAME=$(echo "$POSTGRES_DATABASE_URL" | awk -F'/' '{print $4}')
PG_DB_NAME_SANITIZED=$(echo "$PG_DB_NAME" | sed 's/[^a-zA-Z0-9_.-]/-/g')
PG_DB_CONTAINER_NAME="${PG_DB_NAME_SANITIZED%-}-postgres"

GM_DB_PORT=$(echo "$GREMLIN_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
GM_DB_NAME="$PG_DB_NAME"
GM_DB_NAME_SANITIZED=$(echo "$GM_DB_NAME" | sed 's/[^a-zA-Z0-9_.-]/-/g')
GM_DB_CONTAINER_NAME="${GM_DB_NAME_SANITIZED%-}-gremlin"

# Check if docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker Desktop and try again."
  exit 1
fi

# Check if docker daemon is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

# Check if target Ports are already in use
if command -v nc >/dev/null 2>&1; then
  if nc -z localhost "$PG_DB_PORT" 2>/dev/null; then
    echo "Port $PG_DB_PORT is already in use for Postgres."
    PG_PORT_IN_USE=1
  fi
  if nc -z localhost "$GM_DB_PORT" 2>/dev/null; then
    echo "Port $GM_DB_PORT is already in use for Gremlin."
    GM_PORT_IN_USE=1
  fi
  if [ -n "$PG_PORT_IN_USE" ] || [ -n "$GM_PORT_IN_USE" ]; then
    echo "One or more target ports are already in use; affected services will be skipped."
  fi
else
  echo "Warning: Unable to check if ports are already in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

# Postgres DB Startup
if [ -n "$PG_PORT_IN_USE" ]; then
  echo "Skipping Postgres startup: port $PG_DB_PORT is already in use."
else
  if [ "$(docker ps -q -f name=$PG_DB_CONTAINER_NAME)" ]; then
    echo "Database container '$PG_DB_CONTAINER_NAME' already running"
  elif [ "$(docker ps -q -a -f name=$PG_DB_CONTAINER_NAME)" ]; then
    docker start "$PG_DB_CONTAINER_NAME" >/dev/null 2>&1 && echo "Existing database container '$PG_DB_CONTAINER_NAME' started"
  else
    if [ "$PG_DB_PASSWORD" = "password" ]; then
      echo "You are using the default database password"
      read -p "Should we generate a random password for you? [y/N]: " -r REPLY
      if ! [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please change the default password in the .env file and try again"
      else
        # Generate a random URL-safe password
        PG_DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
        sed -i.bak "s#:password@#:$PG_DB_PASSWORD@#" .env
      fi
    fi

    docker run -d \
      --name $PG_DB_CONTAINER_NAME \
      -e POSTGRES_USER="postgres" \
      -e POSTGRES_PASSWORD="$PG_DB_PASSWORD" \
      -e POSTGRES_DB="$PG_DB_NAME" \
      -p "$PG_DB_PORT":5432 \
      docker.io/postgres >/dev/null && echo "Postgres container '$PG_DB_CONTAINER_NAME' was successfully created"
  fi
fi


# Gremlin DB Startup
if [ -n "$GM_PORT_IN_USE" ]; then
  echo "Skipping Gremlin startup: port $GM_DB_PORT is already in use."
else
  if [ "$(docker ps -q -f name=$GM_DB_CONTAINER_NAME)" ]; then
    echo "Database container '$GM_DB_CONTAINER_NAME' already running"
  elif [ "$(docker ps -q -a -f name=$GM_DB_CONTAINER_NAME)" ]; then
    docker start "$GM_DB_CONTAINER_NAME" >/dev/null 2>&1 && echo "Existing database container '$GM_DB_CONTAINER_NAME' started"
  else
    docker run -d \
      --name $GM_DB_CONTAINER_NAME \
      -p "$GM_DB_PORT":8182 \
      tinkerpop/gremlin-server >/dev/null && echo "Gremlin container '$GM_DB_CONTAINER_NAME' was successfully created"
  fi
fi