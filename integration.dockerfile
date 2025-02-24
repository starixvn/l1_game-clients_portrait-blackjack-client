FROM hub.lumigame.com/base/nginx:brotli-1.20.2-zlib

COPY ./src/.nginx/game.conf /etc/nginx/conf.d/default.conf
COPY ./src/build/web-mobile/ /usr/share/nginx/html
COPY ./src/remote /usr/share/nginx/html/remote