FROM nginx:1.15.11

#install NPM and important tools (lot of data)
RUN apt-get update
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g forever
RUN apt-get install -y git

#install business npm package (also lot of data)
COPY ./build/package.json /node/package.json
COPY ./build/package-lock.json /node/package-lock.json
RUN cd /node/ && npm install

#configure nginx
RUN mkdir /archive/
RUN rm /usr/share/nginx/html/index.html
COPY ./start_script.sh /
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf

#copy static file served by ngingx
COPY ./build/public /usr/share/nginx/html

#copy nodejs server file
COPY ./build/ /node

CMD ["sh", "-c", "/start_script.sh"]