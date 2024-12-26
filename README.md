# Toll Price API

This repository contains a Node.js and Express-based microservice for calculating toll prices based on a Google Maps polyline. The service also includes endpoints for managing toll-related data and requires PostgreSQL with specific extensions.

## Features

- **Dynamic Toll Calculation**: Computes toll prices dynamically based on a provided polyline.
- **RESTful API**: Includes endpoints for listing, retrieving, adding, and updating tolls.
- **Express Framework**: Built on a robust and modular architecture.
- **Database Integration**: Utilizes TypeORM for database interactions.
- **Middleware Integration**: Includes middleware for logging and error handling.

## Project Structure

```
src/
├── app.ts          # Express app configuration
├── controllers/    # Request handlers
├── database/       # Database connection setup
├── middlewares/    # Middleware for validation and error handling
├── models/         # Data models
├── routes/         # API route definitions
├── server.ts       # Server initialization
├── services/       # Business logic and utilities
```

## Installation

### Prerequisites

- Node.js (v16+)
- Yarn (or npm)
- PostgreSQL with the following extensions:
  - `postgis`
  - `postgis_topology`

### Steps

1. Clone the repository:

   ```bash
   git clone https://ivangonzalezg@bitbucket.org/dash-develop/toll-price-api.git
   cd toll-price-api
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Configure environment variables:

   Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=admin
   DB_PASSWORD=admin
   DB_NAME=toll-price
   ```

   Ensure that the PostgreSQL database has the `postgis` and `postgis_topology` extensions enabled.

4. Start the server:

   ```bash
   yarn dev
   ```

## API Endpoints

### GET /tolls

Lists all tolls.

**Response:**

```json
[
  {
    "id": 1,
    "name": "CAPUFE Plaza de Cobro No. 8 - San Martín",
    "latitude": "19.241002",
    "longitude": "-98.385764",
    "prices": [
      {
        "id": 1,
        "vehicleType": "car",
        "amount": "100.000000",
        "currency": "MXN"
      },
      {
        "id": 2,
        "vehicleType": "truck",
        "amount": "150.000000",
        "currency": "MXN"
      }
    ]
  }
]
```

### GET /tolls/:id

Retrieves a specific toll by its ID.

**Response:**

```json
{
  "id": 1,
  "name": "CAPUFE Plaza de Cobro No. 8 - San Martín",
  "latitude": "19.241002",
  "longitude": "-98.385764",
  "prices": [
    {
      "id": 1,
      "vehicleType": "car",
      "amount": "100.000000",
      "currency": "MXN"
    },
    {
      "id": 2,
      "vehicleType": "truck",
      "amount": "150.000000",
      "currency": "MXN"
    }
  ]
}
```

### POST /tolls/price

Calculates toll prices for a given polyline.

**Request Body:**

```json
{
  "polyline": "encoded-polyline-data",
  "vehicleType": "car|truck|motorcycle"
}
```

**Response:**

```json
{
  "cost": 150,
  "tolls": [
    {
      "id": 2,
      "name": "CAPUFE Plaza de Cobro No. 8 - San Martín",
      "latitude": "19.241002",
      "longitude": "-98.385764",
      "amount": 150,
      "currency": "MXN"
    }
  ]
}
```

### POST /tolls

Adds a new toll.

**Request Body:**

```json
{
  "name": "Puebla",
  "latitude": 19.351885424721505,
  "longitude": -99.64715035548221,
  "prices": [
    { "vehicleType": "car", "amount": 100.0, "currency": "MXN" },
    { "vehicleType": "truck", "amount": 150.0, "currency": "MXN" }
  ]
}
```

### PATCH /tolls/:id

Updates an existing toll.

**Request Body:**

```json
{
  "latitude": 19.13339694669784,
  "longitude": -98.27012232209978
}
```

## Development

### Scripts

- **`yarn dev`**: Starts the development server with live reload.
- **`yarn start`**: Starts the server in production mode.
