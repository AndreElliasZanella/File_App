FROM node:20.3.0-alpine3.18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN if [ "$NODE_ENV" = "production" ]; then \
      echo "Building for production"; \
      npm run build -- --target esnext; \
    else \
      echo "Building for development"; \
      npm run build -- --target es2018; \
    fi

FROM node:20.3.0-alpine3.18 AS production
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm install --only=production
EXPOSE 8080
CMD ["npm", "start"]
