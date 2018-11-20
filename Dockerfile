FROM alpine:3.7

RUN apk update

RUN apk add --no-cach python3 libmagic && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools && \
    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi && \
    if [[ ! -e /usr/bin/python ]]; then ln -sf /usr/bin/python3 /usr/bin/python; fi && \
    rm -r /root/.cache

RUN apk add supervisor
RUN apk add nginx
RUN mkdir /run/nginx
RUN chown nginx /run/nginx

RUN pip3 install --upgrade django==2.0.1 docker rethinkdb ramrodbrain ua-parser

WORKDIR /srv/app

COPY . .

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /srv/app/pcp_alpha

EXPOSE 8080

ENTRYPOINT [ "/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
#ENTRYPOINT python3 manage.py runserver 0.0.0.0:8080