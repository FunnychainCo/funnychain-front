FROM nginx:alpine
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/default.conf /etc/nginx/conf.d/default.conf
COPY ./build /usr/share/nginx/html
 