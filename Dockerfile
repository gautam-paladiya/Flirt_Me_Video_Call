FROM node:alpine as todo-app-build

WORKDIR /client

COPY package*.json  ./

RUN npm install --silent

COPY . .

ENV REACT_APP_REST_URL=<backend-app-service-ip>:<port>

RUN yarn build

FROM nginx:latest


COPY --from=todo-app-build /client/build/ /usr/share/nginx/html

EXPOSE 80