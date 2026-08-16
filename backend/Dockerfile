FROM node:22-alpine

WORKDIR /app

ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ARG DIRECT_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/server.js"]