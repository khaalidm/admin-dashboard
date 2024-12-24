# Admin Dashboard

## Description
This project is an Admin Dashboard application built with Angular for the frontend and Node.js for the backend. It uses Docker for containerization and MongoDB as the database.

## Prerequisites
- Docker
- Docker Compose

## Setup Instructions

### 1. Clone the Repository
```sh
git clone git@github.com:khaalidm/admin-dashboard.git
cd admin-dashboard
```

### 2. copy the .example.env file
```sh
cd backend
cp .example.env .env
```
- Fill in necessary environment variables in the .env file
- In particular the mailJet API key and secret, the rest are fine as they are

```
MJ_APIKEY_PUBLIC=your-mail-jet-public-key
MJ_APIKEY_PRIVATE=your-mail-jet-private-key
```

### 3. Build the Docker Containers
```sh
docker-compose build
```

### 4. Start the Docker Containers
```sh
docker-compose up
```

### 5. Register test users
```shell
curl --location 'http://localhost:5000/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test@example.com",
    "password": "1234"
}'
```

### 6. navigate to:

http://localhost:4200/

