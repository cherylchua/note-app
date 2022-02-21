# Note App

## Description

A notes application that features:

-   Creating a user
-   Creating a note that belongs to a user
-   Updating a note's title or content
-   Archiving/ unarchiving a note
-   Deleting a note
-   Get all archived/ unarchived notes belonging to a user with option to pass in a limit, list of notes are returned with latest updated note at the top

### Tech Stack

-   NodeJS
-   Express
-   Jest
-   OpenAPI
-   Knex
-   Sqlite3

## Setup and running the app

### Setup and run locally

Prerequisites: Node v12

1. Create your own `.env` file in the root project folder containing the same environment variables as `.env.example` (or just rename `.env.example` to `.env`)
2. Run `npm install` to download dependencies
3. Run `npm run build` to transpile
4. Run `npm run migrate:latest` to create the DB and tables
5. Run `npm run start` to start the server

#### npm scripts

| Command                     | Description                                   | Prerequisites                                   |
| --------------------------- | --------------------------------------------- | ----------------------------------------------- |
|                             |                                               |                                                 |
| `npm run test`              | Runs all unit tests with a coverage report    | -                                               |
| `npm run build`             | Transpile TS to JS                            | -                                               |
| `npm run start`             | Starts application                            | .env file is in project root, port 3000 is free |
| `npm run watch`             | Start dev server with hot-reload              | .env file is in project root, port 3000 is free |
| `npm run migrate:latest`    | Runs DB migration locally                     | .env file is in project root                    |
| `npm run migrate:down`      | Rollback DB migration locally                 | .env file is in project root                    |
| `npm run docker-compose:up` | Builds and runs the docker container          | Docker is running                               |
| `npm run docker:migrate`    | Runs DB migration within the docker container | Docker is running                               |

### Setup and run with Docker

Prerequisites: Docker, Docker compose

1. Run `docker-compose -f docker-compose.yaml up -d` to spin up the docker container and run it in headless mode
2. Once the container is running, exec into it and run `npm run docker:migrate` to create the DB and tables

\*to access the docker container, list running containers using `docker ps`, copy the `CONTAINER_ID` and run `docker exec -it <CONTAINER_ID> /bin/sh`

## OpenAPI Spec for UX team

The openAPI spec is rendered with the help of Swagger. When the app is running, navigate to `localhost:3000/openapi`.

To test out the APIs, there is a `postman_collection.json` ready in the root directory. To use it, open Postman and import the file. You will need to change the hardcoded `user_id`'s and `note_id`'s

## Decisions and Rationale

### Database

-   I decided to use Sqlite3 because it is lightweight and easy to setup. Alternatively, a postgres DB would be better for production usage and would also decrease the cost of API calls. With Sqlite3, there was no way to execute an `UPDATE ... RETURNING *` and hence this costed me one extra call to the DB to get the updated resource.

### Database client

-   I decided on Knex as a query builder, rather than a full heavyweight ORM (TypeORM) which I thought would be a bit overkill for the app. The main reason for using Knex as opposed to the sqlite3 client was to get the benefits on migration handling. Knex keeps track of migrations and this should allow automation of applying migrations in the CI/CD pipeline in the future.

### OpenAPI
The OpenAPI doc was written before the code during the planning stage, and is also used in the express middleware to validate request and responses allowed by each endpoint. 


## Further Work

-   e2e tests with the `Supertest` library
-   replacing sqlite3 with postgres and running it via docker-compose
-   some form of authentication for users to login
-   a feature to soft delete, to allow users to restore any notes which were accidentally deleted.
