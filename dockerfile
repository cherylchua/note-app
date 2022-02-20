FROM node:12-alpine as builder

WORKDIR /app

# Copy and download dependencies
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:12-alpine

WORKDIR /app

# Copy artefacts from build stage
COPY --from=builder /app/dist/ ./dist
COPY --from=builder /app/node_modules/ ./node_modules
COPY --from=builder /app/package*json ./
COPY --from=builder /app/docs ./docs

CMD npm run start

