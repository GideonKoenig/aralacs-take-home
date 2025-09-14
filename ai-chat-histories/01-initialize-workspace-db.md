# Remove postman and use docker
_Exported on 9/10/2025 at 23:07:49 GMT+2 from Cursor (1.5.11)_

---

**User**

in this script it used to be able to use postman.
however, i use docker.
so can you remove the postman specific stuff and just hardcode to use docker

---

**Cursor**

I'll open `packages/db/start-database.sh` to identify and remove any Postman-specific logic and force Docker usage throughout.

I'll update `packages/db/start-database.sh` to remove Podman detection and hardcode Docker as the container runtime.

```shellscript
#!/usr/bin/env bash
# Use this script to start a docker container for a local development database

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

DB_PASSWORD=$(echo "$DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
DB_PORT=$(echo "$DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')
DB_NAME=$(echo "$DATABASE_URL" | awk -F'/' '{print $4}')
DB_CONTAINER_NAME="$DB_NAME-postgres"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker Desktop and try again."
  exit 1
fi

# use docker as the container runtime
DOCKER_CMD="docker"

if ! $DOCKER_CMD info > /dev/null 2>&1; then
  echo "$DOCKER_CMD daemon is not running. Please start $DOCKER_CMD and try again."
  exit 1
fi

if command -v nc >/dev/null 2>&1; then
  if nc -z localhost "$DB_PORT" 2>/dev/null; then
    echo "Port $DB_PORT is already in use."
    exit 1
  fi
else
  echo "Warning: Unable to check if port $DB_PORT is already in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

if [ "$($DOCKER_CMD ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Database container '$DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$($DOCKER_CMD ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
  $DOCKER_CMD start "$DB_CONTAINER_NAME"
  echo "Existing database container '$DB_CONTAINER_NAME' started"
  exit 0
fi

if [ "$DB_PASSWORD" = "password" ]; then
  echo "You are using the default database password"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please change the default password in the .env file and try again"
    exit 1
  fi
  # Generate a random URL-safe password
  DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
  sed -i '' "s#:password@#:$DB_PASSWORD@#" .env
fi

$DOCKER_CMD run -d \
  --name $DB_CONTAINER_NAME \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB="$DB_NAME" \
  -p "$DB_PORT":5432 \
  docker.io/postgres && echo "Database container '$DB_CONTAINER_NAME' was successfully created"

```

I updated the script to remove Podman support and hardcode Docker as the container runtime. I'll quickly check for any linter issues on the edited file.

- I removed Podman detection and set `DOCKER_CMD="docker"` unconditionally in `packages/db/start-database.sh`. This forces Docker usage and simplifies the install/startup checks.
- No linter issues detected.

---

**User**

is this really needed?
can you just use the commadn directly instead of doing it through this variable?

---

**Cursor**

I'll simplify the script by removing the `DOCKER_CMD` variable and calling `docker` directly everywhere it's used. I'll read the current file to ensure precise edits and then update it.

I'll remove the `DOCKER_CMD` variable and replace all usages with direct `docker` commands, plus adjust related messages. Then I'll check for linter issues on the updated file.

```shellscript
*** Begin Patch
*** Update File: packages/db/start-database.sh
@@
 if ! [ -x "$(command -v docker)" ]; then
   echo -e "Docker is not installed. Please install Docker Desktop and try again."
   exit 1
 fi
 
-# use docker as the container runtime
-DOCKER_CMD="docker"
-
-if ! $DOCKER_CMD info > /dev/null 2>&1; then
-  echo "$DOCKER_CMD daemon is not running. Please start $DOCKER_CMD and try again."
+if ! docker info > /dev/null 2>&1; then
+  echo "Docker daemon is not running. Please start Docker and try again."
   exit 1
 fi
@@
-if [ "$("$DOCKER_CMD" ps -q -f name=$DB_CONTAINER_NAME)" ]; then
+if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
   echo "Database container '$DB_CONTAINER_NAME' already running"
   exit 0
 fi
 
-if [ "$("$DOCKER_CMD" ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
-  $DOCKER_CMD start "$DB_CONTAINER_NAME"
+if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
+  docker start "$DB_CONTAINER_NAME"
   echo "Existing database container '$DB_CONTAINER_NAME' started"
   exit 0
 fi
@@
-$DOCKER_CMD run -d \
+docker run -d \
   --name $DB_CONTAINER_NAME \
   -e POSTGRES_USER="postgres" \
   -e POSTGRES_PASSWORD="$DB_PASSWORD" \
   -e POSTGRES_DB="$DB_NAME" \
   -p "$DB_PORT":5432 \
   docker.io/postgres && echo "Database container '$DB_CONTAINER_NAME' was successfully created"
*** End Patch
```

```shellscript
*** Begin Patch
*** Update File: packages/db/start-database.sh
@@
-# use docker as the container runtime
-DOCKER_CMD="docker"
+ 
@@
-if ! $DOCKER_CMD info > /dev/null 2>&1; then
-  echo "$DOCKER_CMD daemon is not running. Please start $DOCKER_CMD and try again."
+if ! docker info > /dev/null 2>&1; then
+  echo "Docker daemon is not running. Please start Docker and try again."
   exit 1
 fi
@@
-if [ "$("$DOCKER_CMD" ps -q -f name=$DB_CONTAINER_NAME)" ]; then
+if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
   echo "Database container '$DB_CONTAINER_NAME' already running"
   exit 0
 fi
 
-if [ "$("$DOCKER_CMD" ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
-  $DOCKER_CMD start "$DB_CONTAINER_NAME"
+if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
+  docker start "$DB_CONTAINER_NAME"
   echo "Existing database container '$DB_CONTAINER_NAME' started"
   exit 0
 fi
@@
-$DOCKER_CMD run -d \
+docker run -d \
   --name $DB_CONTAINER_NAME \
   -e POSTGRES_USER="postgres" \
   -e POSTGRES_PASSWORD="$DB_PASSWORD" \
   -e POSTGRES_DB="$DB_NAME" \
   -p "$DB_PORT":5432 \
   docker.io/postgres && echo "Database container '$DB_CONTAINER_NAME' was successfully created"
*** End Patch
```

I'm going to re-open the file to capture the exact current lines so I can precisely replace `DOCKER_CMD` usages with direct `docker` commands without context mismatches.

```shellscript
*** Begin Patch
*** Update File: packages/db/start-database.sh
@@
-# use docker as the container runtime
-DOCKER_CMD="docker"
+ 
@@
-if ! $DOCKER_CMD info > /dev/null 2>&1; then
-  echo "$DOCKER_CMD daemon is not running. Please start $DOCKER_CMD and try again."
+if ! docker info > /dev/null 2>&1; then
+  echo "Docker daemon is not running. Please start Docker and try again."
   exit 1
 fi
@@
-if [ "$("$DOCKER_CMD" ps -q -f name=$DB_CONTAINER_NAME)" ]; then
+if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
   echo "Database container '$DB_CONTAINER_NAME' already running"
   exit 0
 fi
@@
-if [ "$("$DOCKER_CMD" ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
-  $DOCKER_CMD start "$DB_CONTAINER_NAME"
+if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
+  docker start "$DB_CONTAINER_NAME"
   echo "Existing database container '$DB_CONTAINER_NAME' started"
   exit 0
 fi
@@
-$DOCKER_CMD run -d \
+docker run -d \
   --name $DB_CONTAINER_NAME \
   -e POSTGRES_USER="postgres" \
   -e POSTGRES_PASSWORD="$DB_PASSWORD" \
   -e POSTGRES_DB="$DB_NAME" \
   -p "$DB_PORT":5432 \
   docker.io/postgres && echo "Database container '$DB_CONTAINER_NAME' was successfully created"
*** End Patch
```

```shellscript
#!/usr/bin/env bash
# Use this script to start a docker container for a local development database

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

DB_PASSWORD=$(echo "$DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
DB_PORT=$(echo "$DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')
DB_NAME=$(echo "$DATABASE_URL" | awk -F'/' '{print $4}')
DB_CONTAINER_NAME="$DB_NAME-postgres"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker Desktop and try again."
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

if command -v nc >/dev/null 2>&1; then
  if nc -z localhost "$DB_PORT" 2>/dev/null; then
    echo "Port $DB_PORT is already in use."
    exit 1
  fi
else
  echo "Warning: Unable to check if port $DB_PORT is already in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Database container '$DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
  docker start "$DB_CONTAINER_NAME"
  echo "Existing database container '$DB_CONTAINER_NAME' started"
  exit 0
fi

if [ "$DB_PASSWORD" = "password" ]; then
  echo "You are using the default database password"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please change the default password in the .env file and try again"
    exit 1
  fi
  # Generate a random URL-safe password
  DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
  sed -i '' "s#:password@#:$DB_PASSWORD@#" .env
fi

docker run -d \
  --name $DB_CONTAINER_NAME \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB="$DB_NAME" \
  -p "$DB_PORT":5432 \
  docker.io/postgres && echo "Database container '$DB_CONTAINER_NAME' was successfully created"

```

I removed the variable and updated the script to call `docker` directly in all places. I'll quickly check the file for any linter issues.

- Yes, it wasn’t needed. I removed `DOCKER_CMD` and now the script calls `docker` directly for `info`, `ps`, `start`, and `run`.
- No linter issues detected.

---

**User**

i assume this creates a new postgres docker container.
what does the -d flag to?
where is the name of the base docker container?

---

**Cursor**

- **Does it create a new container?** Yes. If a container named `$PG_DB_CONTAINER_NAME` doesn’t exist, `docker run` creates it; if it exists, the script starts it instead.
- **What does `-d` do?** Runs the container in detached mode (background), returning control to your shell immediately.
- **Where is the base image name?** At the end of the command: `docker.io/postgres` (equivalent to `postgres:latest` from Docker Hub).
- **What is the container name?** Set by `--name $PG_DB_CONTAINER_NAME`, which the script builds as `"$PG_DB_NAME-postgres"`.

---

**User**

I would like this script to also create a apache tinkerPop gremlin server container in the same fashion as this postgres container.
the env variable name is GREMLIN_DATABASE_URL

however, the connection string is formatted differently.
It's currently this:
GREMLIN_DATABASE_URL="ws://localhost:8182/gremlin"

also the startup command looks like this:
 docker run -d \
      --name $GREMLIN_CONTAINER_NAME \
      -p "$GREMLIN_PORT":8182 \
      tinkerpop/gremlin-server:3.7.1 && echo "Gremlin container '$GREMLIN_CONTAINER_NAME' was successfully created"

so for this we only really need the port and the container name.
use the pg-db-name as a subsitute for the gm-db-name the gremlin database name, as it doesnt exist.
the variable names should use a different prefix than pg (postgres).

---

**Cursor**

I'll add tasks to implement Gremlin container creation alongside Postgres, then update the script: parse GREMLIN env vars, adjust port checks, remove early exits for Postgres so both containers are handled, and add Gremlin container lifecycle logic. Then I'll run lints.

I'll open the latest version of the script to ensure I integrate Gremlin container logic with the current variable names, then implement the changes, and update the TODOs accordingly.

I’m going to update the script to:
- Parse `GREMLIN_DATABASE_URL` into `GM_DB_*` variables.
- Remove early exits after Postgres handling so Gremlin can also be set up.
- Add logic to start or create the Gremlin container similarly to Postgres.
Then I’ll run a lint check and update the TODOs accordingly.

```shellscript
#!/usr/bin/env bash
# Use this script to start docker containers for the local development databases

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

PG_DB_PASSWORD=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
PG_DB_PORT=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')
PG_DB_NAME=$(echo "$POSTGRES_DATABASE_URL" | awk -F'/' '{print $4}')
PG_DB_CONTAINER_NAME="$PG_DB_NAME-postgres"

GM_DB_PORT=$(echo "$GREMLIN_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
GM_DB_NAME="$PG_DB_NAME"
GM_DB_CONTAINER_NAME="$GM_DB_NAME-gremlin"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker Desktop and try again."
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

if command -v nc >/dev/null 2>&1; then
  if nc -z localhost "$PG_DB_PORT" 2>/dev/null; then
    echo "Port $PG_DB_PORT is already in use."
    exit 1
  fi
else
  echo "Warning: Unable to check if port $PG_DB_PORT is already in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

if [ "$(docker ps -q -f name=$PG_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$PG_DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$PG_DB_CONTAINER_NAME)" ]; then
  docker start "$PG_DB_CONTAINER_NAME"
  echo "Existing database container '$PG_DB_CONTAINER_NAME' started"
  exit 0
fi

if [ "$PG_DB_PASSWORD" = "password" ]; then
  echo "You are using the default database password"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please change the default password in the .env file and try again"
    exit 1
  fi
  # Generate a random URL-safe password
  PG_DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
  sed -i '' "s#:password@#:$PG_DB_PASSWORD@#" .env
fi

docker run -d \
  --name $PG_DB_CONTAINER_NAME \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="$PG_DB_PASSWORD" \
  -e POSTGRES_DB="$PG_DB_NAME" \
  -p "$PG_DB_PORT":5432 \
  docker.io/postgres && echo "Database container '$PG_DB_CONTAINER_NAME' was successfully created"

```

```shellscript
#!/usr/bin/env bash
# Use this script to start docker containers for the local development databases

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

PG_DB_PASSWORD=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
PG_DB_PORT=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')
PG_DB_NAME=$(echo "$POSTGRES_DATABASE_URL" | awk -F'/' '{print $4}')
PG_DB_CONTAINER_NAME="$PG_DB_NAME-postgres"

GM_DB_PORT=$(echo "$GREMLIN_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
GM_DB_NAME="$PG_DB_NAME"
GM_DB_CONTAINER_NAME="$GM_DB_NAME-gremlin"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker Desktop and try again."
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

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
    exit 1
  fi
else
  echo "Warning: Unable to check if ports are already in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

if [ "$(docker ps -q -f name=$PG_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$PG_DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$PG_DB_CONTAINER_NAME)" ]; then
  docker start "$PG_DB_CONTAINER_NAME"
  echo "Existing database container '$PG_DB_CONTAINER_NAME' started"
  exit 0
fi

if [ "$PG_DB_PASSWORD" = "password" ]; then
  echo "You are using the default database password"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please change the default password in the .env file and try again"
    exit 1
  fi
  # Generate a random URL-safe password
  PG_DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
  sed -i '' "s#:password@#:$PG_DB_PASSWORD@#" .env
fi

docker run -d \
  --name $PG_DB_CONTAINER_NAME \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="$PG_DB_PASSWORD" \
  -e POSTGRES_DB="$PG_DB_NAME" \
  -p "$PG_DB_PORT":5432 \
  docker.io/postgres && echo "Database container '$PG_DB_CONTAINER_NAME' was successfully created"

```

```shellscript
#!/usr/bin/env bash
# Use this script to start docker containers for the local development databases

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

PG_DB_PASSWORD=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
PG_DB_PORT=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')
PG_DB_NAME=$(echo "$POSTGRES_DATABASE_URL" | awk -F'/' '{print $4}')
PG_DB_CONTAINER_NAME="$PG_DB_NAME-postgres"

GM_DB_PORT=$(echo "$GREMLIN_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
GM_DB_NAME="$PG_DB_NAME"
GM_DB_CONTAINER_NAME="$GM_DB_NAME-gremlin"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker Desktop and try again."
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

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
    exit 1
  fi
else
  echo "Warning: Unable to check if ports are already in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

if [ "$(docker ps -q -f name=$PG_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$PG_DB_CONTAINER_NAME' already running"
else
  if [ "$(docker ps -q -a -f name=$PG_DB_CONTAINER_NAME)" ]; then
    docker start "$PG_DB_CONTAINER_NAME"
    echo "Existing database container '$PG_DB_CONTAINER_NAME' started"
  else
    if [ "$PG_DB_PASSWORD" = "password" ]; then
      echo "You are using the default database password"
      read -p "Should we generate a random password for you? [y/N]: " -r REPLY
      if ! [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please change the default password in the .env file and try again"
        exit 1
      fi
      PG_DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
      sed -i '' "s#:password@#:$PG_DB_PASSWORD@#" .env
    fi
    docker run -d \
      --name $PG_DB_CONTAINER_NAME \
      -e POSTGRES_USER="postgres" \
      -e POSTGRES_PASSWORD="$PG_DB_PASSWORD" \
      -e POSTGRES_DB="$PG_DB_NAME" \
      -p "$PG_DB_PORT":5432 \
      docker.io/postgres && echo "Database container '$PG_DB_CONTAINER_NAME' was successfully created"
  fi
fi

```

```shellscript
#!/usr/bin/env bash
# Use this script to start docker containers for the local development databases

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

PG_DB_PASSWORD=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
PG_DB_PORT=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')
PG_DB_NAME=$(echo "$POSTGRES_DATABASE_URL" | awk -F'/' '{print $4}')
PG_DB_CONTAINER_NAME="$PG_DB_NAME-postgres"

GM_DB_PORT=$(echo "$GREMLIN_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
GM_DB_NAME="$PG_DB_NAME"
GM_DB_CONTAINER_NAME="$GM_DB_NAME-gremlin"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker Desktop and try again."
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

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
    exit 1
  fi
else
  echo "Warning: Unable to check if ports are already in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

if [ "$(docker ps -q -f name=$PG_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$PG_DB_CONTAINER_NAME' already running"
else
  if [ "$(docker ps -q -a -f name=$PG_DB_CONTAINER_NAME)" ]; then
    docker start "$PG_DB_CONTAINER_NAME"
    echo "Existing database container '$PG_DB_CONTAINER_NAME' started"
  else
    if [ "$PG_DB_PASSWORD" = "password" ]; then
      echo "You are using the default database password"
      read -p "Should we generate a random password for you? [y/N]: " -r REPLY
      if ! [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please change the default password in the .env file and try again"
        exit 1
      fi
      PG_DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
      sed -i '' "s#:password@#:$PG_DB_PASSWORD@#" .env
    fi
    docker run -d \
      --name $PG_DB_CONTAINER_NAME \
      -e POSTGRES_USER="postgres" \
      -e POSTGRES_PASSWORD="$PG_DB_PASSWORD" \
      -e POSTGRES_DB="$PG_DB_NAME" \
      -p "$PG_DB_PORT":5432 \
      docker.io/postgres && echo "Database container '$PG_DB_CONTAINER_NAME' was successfully created"
  fi
fi

# Gremlin container
if [ "$(docker ps -q -f name=$GM_DB_CONTAINER_NAME)" ]; then
  echo "Gremlin container '$GM_DB_CONTAINER_NAME' already running"
else
  if [ "$(docker ps -q -a -f name=$GM_DB_CONTAINER_NAME)" ]; then
    docker start "$GM_DB_CONTAINER_NAME"
    echo "Existing Gremlin container '$GM_DB_CONTAINER_NAME' started"
  else
    docker run -d \
      --name $GM_DB_CONTAINER_NAME \
      -p "$GM_DB_PORT":8182 \
      tinkerpop/gremlin-server:3.7.1 && echo "Gremlin container '$GM_DB_CONTAINER_NAME' was successfully created"
  fi
fi

```

- Added Gremlin support: parsed `GREMLIN_DATABASE_URL` into `GM_DB_PORT`, set `GM_DB_NAME="$PG_DB_NAME"`, and `GM_DB_CONTAINER_NAME="$GM_DB_NAME-gremlin"`.
- Updated port checks to include both Postgres and Gremlin; exits if either port is in use.
- Adjusted Postgres flow to avoid early exits so Gremlin setup always runs.
- Implemented Gremlin container lifecycle: start if exists, otherwise create with:
```bash
docker run -d \
  --name $GM_DB_CONTAINER_NAME \
  -p "$GM_DB_PORT":8182 \
  tinkerpop/gremlin-server:3.7.1 && echo "Gremlin container '$GM_DB_CONTAINER_NAME' was successfully created"
```

- No linter issues detected.

- To run, ensure `.env` has `POSTGRES_DATABASE_URL` and `GREMLIN_DATABASE_URL="ws://localhost:8182/gremlin"`, then execute `./packages/db/start-database.sh`.

```shellscript
docker run -d \
  --name $GM_DB_CONTAINER_NAME \
  -p "$GM_DB_PORT":8182 \
  tinkerpop/gremlin-server:3.7.1 && echo "Gremlin container '$GM_DB_CONTAINER_NAME' was successfully created"
```

---

**User**

when I run the script currently I only get this as output.
The containers dont seem to have started.
Whats going on?



---

**Cursor**

I'll fix the invalid container name issue by sanitizing names derived from URLs, remove the awk escape warning, and ensure Gremlin uses the sanitized base name. Then I'll run a linter check.

```shellscript
#!/usr/bin/env bash
# Use this script to start docker containers for the local development databases

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

PG_DB_PASSWORD=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
PG_DB_PORT=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $4}' | awk -F'/' '{print $1}')
PG_DB_NAME=$(echo "$POSTGRES_DATABASE_URL" | awk -F'/' '{print $4}')
PG_DB_CONTAINER_NAME="$PG_DB_NAME-postgres"

GM_DB_PORT=$(echo "$GREMLIN_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
GM_DB_NAME="$PG_DB_NAME"
GM_DB_CONTAINER_NAME="$GM_DB_NAME-gremlin"

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
    exit 1
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
if [ "$(docker ps -q -f name=$PG_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$PG_DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$PG_DB_CONTAINER_NAME)" ]; then
  docker start "$PG_DB_CONTAINER_NAME"
  echo "Existing database container '$PG_DB_CONTAINER_NAME' started"
  exit 0
fi

if [ "$PG_DB_PASSWORD" = "password" ]; then
  echo "You are using the default database password"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please change the default password in the .env file and try again"
    exit 1
  fi
  # Generate a random URL-safe password
  PG_DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
  sed -i '' "s#:password@#:$PG_DB_PASSWORD@#" .env
fi

docker run -d \
  --name $PG_DB_CONTAINER_NAME \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="$PG_DB_PASSWORD" \
  -e POSTGRES_DB="$PG_DB_NAME" \
  -p "$PG_DB_PORT":5432 \
  docker.io/postgres && echo "Database container '$PG_DB_CONTAINER_NAME' was successfully created"


# Gremlin DB Startup
if [ "$(docker ps -q -f name=$GM_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$GM_DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$GM_DB_CONTAINER_NAME)" ]; then
  docker start "$GM_DB_CONTAINER_NAME"
  echo "Existing database container '$GM_DB_CONTAINER_NAME' started"
  exit 0
fi

docker run -d \
  --name $GM_DB_CONTAINER_NAME \
  -p "$GM_DB_PORT":8182 \
  tinkerpop/gremlin-server && echo "Gremlin container '$GM_DB_CONTAINER_NAME' was successfully created"
```

```shellscript
#!/usr/bin/env bash
# Use this script to start docker containers for the local development databases

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

PG_DB_PASSWORD=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
PG_DB_PORT=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $4}' | awk -F'/' '{print $1}')
PG_DB_NAME=$(echo "$POSTGRES_DATABASE_URL" | awk -F'/' '{print $4}')
PG_DB_NAME_SANITIZED=$(echo "$PG_DB_NAME" | sed 's/[^a-zA-Z0-9_.-]/-/g')
PG_DB_CONTAINER_NAME="$PG_DB_NAME_SANITIZED-postgres"

GM_DB_PORT=$(echo "$GREMLIN_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
GM_DB_NAME="$PG_DB_NAME"
GM_DB_NAME_SANITIZED=$(echo "$GM_DB_NAME" | sed 's/[^a-zA-Z0-9_.-]/-/g')
GM_DB_CONTAINER_NAME="$GM_DB_NAME_SANITIZED-gremlin"

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
    exit 1
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
if [ "$(docker ps -q -f name=$PG_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$PG_DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$PG_DB_CONTAINER_NAME)" ]; then
  docker start "$PG_DB_CONTAINER_NAME"
  echo "Existing database container '$PG_DB_CONTAINER_NAME' started"
  exit 0
fi

if [ "$PG_DB_PASSWORD" = "password" ]; then
  echo "You are using the default database password"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please change the default password in the .env file and try again"
    exit 1
  fi
  # Generate a random URL-safe password
  PG_DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
  sed -i '' "s#:password@#:$PG_DB_PASSWORD@#" .env
fi

docker run -d \
  --name $PG_DB_CONTAINER_NAME \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="$PG_DB_PASSWORD" \
  -e POSTGRES_DB="$PG_DB_NAME" \
  -p "$PG_DB_PORT":5432 \
  docker.io/postgres && echo "Database container '$PG_DB_CONTAINER_NAME' was successfully created"


# Gremlin DB Startup
if [ "$(docker ps -q -f name=$GM_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$GM_DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$GM_DB_CONTAINER_NAME)" ]; then
  docker start "$GM_DB_CONTAINER_NAME"
  echo "Existing database container '$GM_DB_CONTAINER_NAME' started"
  exit 0
fi

docker run -d \
  --name $GM_DB_CONTAINER_NAME \
  -p "$GM_DB_PORT":8182 \
  tinkerpop/gremlin-server && echo "Gremlin container '$GM_DB_CONTAINER_NAME' was successfully created"
```

```shellscript
#!/usr/bin/env bash
# Use this script to start docker containers for the local development databases

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

PG_DB_PASSWORD=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
PG_DB_PORT=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $4}' | awk -F'/' '{print $1}')
PG_DB_NAME=$(echo "$POSTGRES_DATABASE_URL" | awk -F'/' '{print $4}')
PG_DB_NAME_SANITIZED=$(echo "$PG_DB_NAME" | sed 's/[^a-zA-Z0-9_.-]/-/g')
PG_DB_CONTAINER_NAME="$PG_DB_NAME_SANITIZED-postgres"

GM_DB_PORT=$(echo "$GREMLIN_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
GM_DB_NAME="$PG_DB_NAME"
GM_DB_NAME_SANITIZED=$(echo "$GM_DB_NAME" | sed 's/[^a-zA-Z0-9_.-]/-/g')
GM_DB_CONTAINER_NAME="$GM_DB_NAME_SANITIZED-gremlin"

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
    exit 1
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
if [ "$(docker ps -q -f name=$PG_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$PG_DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$PG_DB_CONTAINER_NAME)" ]; then
  docker start "$PG_DB_CONTAINER_NAME"
  echo "Existing database container '$PG_DB_CONTAINER_NAME' started"
  exit 0
fi

if [ "$PG_DB_PASSWORD" = "password" ]; then
  echo "You are using the default database password"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please change the default password in the .env file and try again"
    exit 1
  fi
  # Generate a random URL-safe password
  PG_DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
  sed -i '' "s#:password@#:$PG_DB_PASSWORD@#" .env
fi

docker run -d \
  --name $PG_DB_CONTAINER_NAME \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="$PG_DB_PASSWORD" \
  -e POSTGRES_DB="$PG_DB_NAME" \
  -p "$PG_DB_PORT":5432 \
  docker.io/postgres && echo "Database container '$PG_DB_CONTAINER_NAME' was successfully created"


# Gremlin DB Startup
if [ "$(docker ps -q -f name=$GM_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$GM_DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$GM_DB_CONTAINER_NAME)" ]; then
  docker start "$GM_DB_CONTAINER_NAME"
  echo "Existing database container '$GM_DB_CONTAINER_NAME' started"
  exit 0
fi

docker run -d \
  --name $GM_DB_CONTAINER_NAME \
  -p "$GM_DB_PORT":8182 \
  tinkerpop/gremlin-server:3.7.1 && echo "Gremlin container '$GM_DB_CONTAINER_NAME' was successfully created"
```

I'm going to fix the control flow so Postgres doesn't exit early and prevent Gremlin from starting, and update both startup sections to use an if/elif/else structure. Then I'll lint the script.

```shellscript
#!/usr/bin/env bash
# Use this script to start docker containers for the local development databases

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

PG_DB_PASSWORD=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
PG_DB_PORT=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $4}' | awk -F'/' '{print $1}')
PG_DB_NAME=$(echo "$POSTGRES_DATABASE_URL" | awk -F'/' '{print $4}')
PG_DB_NAME_SANITIZED=$(echo "$PG_DB_NAME" | sed 's/[^a-zA-Z0-9_.-]/-/g')
PG_DB_CONTAINER_NAME="$PG_DB_NAME_SANITIZED-postgres"

GM_DB_PORT=$(echo "$GREMLIN_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
GM_DB_NAME="$PG_DB_NAME"
GM_DB_NAME_SANITIZED=$(echo "$GM_DB_NAME" | sed 's/[^a-zA-Z0-9_.-]/-/g')
GM_DB_CONTAINER_NAME="$GM_DB_NAME_SANITIZED-gremlin"

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
    exit 1
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
if [ "$(docker ps -q -f name=$PG_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$PG_DB_CONTAINER_NAME' already running"
elif [ "$(docker ps -q -a -f name=$PG_DB_CONTAINER_NAME)" ]; then
  docker start "$PG_DB_CONTAINER_NAME"
  echo "Existing database container '$PG_DB_CONTAINER_NAME' started"
else
  if [ "$PG_DB_PASSWORD" = "password" ]; then
    echo "You are using the default database password"
    read -p "Should we generate a random password for you? [y/N]: " -r REPLY
    if ! [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Please change the default password in the .env file and try again"
      exit 1
    fi
    # Generate a random URL-safe password
    PG_DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
    sed -i '' "s#:password@#:$PG_DB_PASSWORD@#" .env
  fi
  docker run -d \
    --name $PG_DB_CONTAINER_NAME \
    -e POSTGRES_USER="postgres" \
    -e POSTGRES_PASSWORD="$PG_DB_PASSWORD" \
    -e POSTGRES_DB="$PG_DB_NAME" \
    -p "$PG_DB_PORT":5432 \
    docker.io/postgres && echo "Database container '$PG_DB_CONTAINER_NAME' was successfully created"
fi


# Gremlin DB Startup
if [ "$(docker ps -q -f name=$GM_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$GM_DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$GM_DB_CONTAINER_NAME)" ]; then
  docker start "$GM_DB_CONTAINER_NAME"
  echo "Existing database container '$GM_DB_CONTAINER_NAME' started"
  exit 0
fi

docker run -d \
  --name $GM_DB_CONTAINER_NAME \
  -p "$GM_DB_PORT":8182 \
  tinkerpop/gremlin-server:3.7.1 && echo "Gremlin container '$GM_DB_CONTAINER_NAME' was successfully created"
```

```shellscript
#!/usr/bin/env bash
# Use this script to start docker containers for the local development databases

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

# import env variables from .env
set -a
source .env

PG_DB_PASSWORD=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
PG_DB_PORT=$(echo "$POSTGRES_DATABASE_URL" | awk -F':' '{print $4}' | awk -F'/' '{print $1}')
PG_DB_NAME=$(echo "$POSTGRES_DATABASE_URL" | awk -F'/' '{print $4}')
PG_DB_NAME_SANITIZED=$(echo "$PG_DB_NAME" | sed 's/[^a-zA-Z0-9_.-]/-/g')
PG_DB_CONTAINER_NAME="$PG_DB_NAME_SANITIZED-postgres"

GM_DB_PORT=$(echo "$GREMLIN_DATABASE_URL" | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
GM_DB_NAME="$PG_DB_NAME"
GM_DB_NAME_SANITIZED=$(echo "$GM_DB_NAME" | sed 's/[^a-zA-Z0-9_.-]/-/g')
GM_DB_CONTAINER_NAME="$GM_DB_NAME_SANITIZED-gremlin"

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
    exit 1
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
if [ "$(docker ps -q -f name=$PG_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$PG_DB_CONTAINER_NAME' already running"
elif [ "$(docker ps -q -a -f name=$PG_DB_CONTAINER_NAME)" ]; then
  docker start "$PG_DB_CONTAINER_NAME"
  echo "Existing database container '$PG_DB_CONTAINER_NAME' started"
else
  if [ "$PG_DB_PASSWORD" = "password" ]; then
    echo "You are using the default database password"
    read -p "Should we generate a random password for you? [y/N]: " -r REPLY
    if ! [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Please change the default password in the .env file and try again"
      exit 1
    fi
    # Generate a random URL-safe password
    PG_DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
    sed -i '' "s#:password@#:$PG_DB_PASSWORD@#" .env
  fi
  docker run -d \
    --name $PG_DB_CONTAINER_NAME \
    -e POSTGRES_USER="postgres" \
    -e POSTGRES_PASSWORD="$PG_DB_PASSWORD" \
    -e POSTGRES_DB="$PG_DB_NAME" \
    -p "$PG_DB_PORT":5432 \
    docker.io/postgres && echo "Database container '$PG_DB_CONTAINER_NAME' was successfully created"
fi


# Gremlin DB Startup
if [ "$(docker ps -q -f name=$GM_DB_CONTAINER_NAME)" ]; then
  echo "Database container '$GM_DB_CONTAINER_NAME' already running"
elif [ "$(docker ps -q -a -f name=$GM_DB_CONTAINER_NAME)" ]; then
  docker start "$GM_DB_CONTAINER_NAME"
  echo "Existing database container '$GM_DB_CONTAINER_NAME' started"
else
  docker run -d \
    --name $GM_DB_CONTAINER_NAME \
    -p "$GM_DB_PORT":8182 \
    tinkerpop/gremlin-server:3.7.1 && echo "Gremlin container '$GM_DB_CONTAINER_NAME' was successfully created"
fi
```

I saw two issues stopping startup:
- Invalid container names: names derived from the URL weren’t sanitized; Docker rejected them. I now sanitize to only [a-zA-Z0-9_.-], which also neutralizes CRLF in `.env`.
- Early exits: the Postgres block exited early, preventing Gremlin from starting. I refactored both flows to if/elif/else without exiting.

Also fixed:
- Removed awk escape warning.
- Pinned Gremlin image to `tinkerpop/gremlin-server:3.7.1`.
- Added port checks for both containers.

Try rerunning the script, then verify:
```bash
docker ps --filter "name=-postgres" --filter "name=-gremlin" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

If they still don’t start, please paste the new output.

```shellscript
docker ps --filter "name=-postgres" --filter "name=-gremlin" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

