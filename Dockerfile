FROM node:22-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

EXPOSE 3001

CMD ["npm", "run", "start"]
