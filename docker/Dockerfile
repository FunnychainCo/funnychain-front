FROM nginx:alpine
RUN mkdir /archive/
COPY ./start_script.sh /
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./build /usr/share/nginx/html
 
CMD ["sh", "-c", "/start_script.sh"]