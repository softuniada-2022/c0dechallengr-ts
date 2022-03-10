FROM node:17-alpine
EXPOSE 8000

WORKDIR /app
COPY package.json .
COPY yarn.lock .
WORKDIR /app/server
COPY server/package.json .
WORKDIR /app/vue
COPY vue/package.json .

WORKDIR /app
RUN yarn install

WORKDIR /app/vue
COPY vue .
RUN yarn build
WORKDIR /app
RUN mv vue/dist server/dist

WORKDIR /app/server
COPY server .
RUN yarn typecheck

WORKDIR /app
COPY ormconfig.json .

WORKDIR /app/server
CMD ["yarn", "start"]