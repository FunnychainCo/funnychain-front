#/bin/sh
#copy current version to the permanent archive (allow multiple version of this website to co exist)
cp -rf /usr/share/nginx/html/* /archive/

#start nginx
nginx -g "daemon off;"