FROM nginx:1.15.11

RUN apt-get update
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g forever

RUN mkdir /archive/
RUN rm /usr/share/nginx/html/index.html
COPY ./start_script.sh /
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./build/public /usr/share/nginx/html

COPY ./build/ /node
RUN cd /node/ && npm install
 
CMD ["sh", "-c", "/start_script.sh"]