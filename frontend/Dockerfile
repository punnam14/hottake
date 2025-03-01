# FROM node:18-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# EXPOSE 5173
# CMD ["npm", "run", "dev", "--", "--host"]


# Stage 1: Build the production assets
FROM node:16 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build   # This should produce a static bundle in (typically) a `dist` folder

# Stage 2: Serve static assets using Nginx
FROM nginx:stable-alpine
# Remove default nginx static files if necessary
RUN rm -rf /usr/share/nginx/html/*
# Copy your production build output to Nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
