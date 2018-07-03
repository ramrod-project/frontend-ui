FROM alpine:3.7

RUN apk add --no-cach python3 && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools && \
    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi && \
    if [[ ! -e /usr/bin/python ]]; then ln -sf /usr/bin/python3 /usr/bin/python; fi && \
    rm -r /root/.cache

RUN pip3 install django==2.0.1 docker rethinkdb ramrodbrain>=0.1.32 ua-parser

WORKDIR /srv/app

COPY . .

WORKDIR /srv/app/pcp_alpha

EXPOSE 8080

ENTRYPOINT python3 manage.py runserver 0.0.0.0:8080