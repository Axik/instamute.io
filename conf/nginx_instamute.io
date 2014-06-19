log_root=/var/noneandvoid
proj_root=/home/git/ssmid.io

upstream django {
    server unix://%log_root%/uwsgi.sock;
}


server {

    listen 80;
    server_name instamute.io www.instamute.io noneandvoid.cloudapp.net www.noneandvoid.cloudapp.net;
    charset utf-8;

    location /static {

    alias %proj_root%/instamute.io/public/static;

    }

    location /static/admin {

    alias %proj_root%/lib/python3.4/site-packages/django/contrib/admin/static/admin;

    }


    location / {

    uwsgi_pass django;
    include /etc/nginx/uwsgi_params;

    }
}
