FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY src ./src
COPY .env ./

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]


# Ejecutar migraciones antes de levantar la app
CMD npx prisma migrate deploy && npm run start:dev