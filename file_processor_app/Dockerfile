FROM node:18
WORKDIR /app
COPY package*.json ./
RUN rm -rf node_modules/
RUN rm package-lock.json
RUN npm install
COPY . .

EXPOSE 5173