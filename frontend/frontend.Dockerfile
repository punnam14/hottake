FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY dist/ .
CMD ["nginx", "-g", "daemon off;"]