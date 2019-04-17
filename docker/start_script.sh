#/bin/sh
#copy current version to the permanent archive (allow multiple version of this website to co exist)
cp -rf /usr/share/nginx/html/* /archive/

#cd /
#node node/server.js
echo "node logs are in /node/out.log and /node/err.log"
NODE_ENV=production forever start -o /node/out.log -e /node/err.log /node/server.js

#start nginx
nginx -g "daemon off;"