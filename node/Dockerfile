FROM node:latest

COPY . /var/www
WORKDIR /var/www
EXPOSE 80
EXPOSE 443

RUN npm install

ENTRYPOINT ["npm", "run", "debug"]
