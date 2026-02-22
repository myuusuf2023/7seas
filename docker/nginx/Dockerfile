FROM node:18-alpine AS frontend-build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .

ARG REACT_APP_API_URL=/api
ARG REACT_APP_APP_NAME=7-Seas Suites Management
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_APP_NAME=$REACT_APP_APP_NAME

RUN npm run build

FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy React build from frontend stage
COPY --from=frontend-build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
