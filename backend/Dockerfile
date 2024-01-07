FROM node:latest

WORKDIR /usr/app
COPY server.js .
RUN npm install cors
RUN npm install express
RUN npm install mysql2
ENTRYPOINT [ "node", "server.js" ]