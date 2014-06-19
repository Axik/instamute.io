Instamute.io
=========

This project is prototype for easy voice chatting people for online games or anything else.
The main idea is create web-app that give you create room in one click and invite your friends by giving them link of this room.



Stack of using technologies you can see in requirements/production.txt (We use python3)


### Setup project.
1. If you want to setup project to production stage, you need clone [this repository](https://github.com/Axik/instamute.io), create [python virtual environment](https://virtualenv.pypa.io/en/latest/), and then just run:  
`make`  
It will will install all dependencies, create database and collect static to $root_project/public/static folder.

2. If you want to setup project for development on local machine, clone [this repository](https://github.com/Axik/instamute.io), create [python virtual environment](https://virtualenv.pypa.io/en/latest/), and then run:  
`make unpack`  
This will install all dependencies, setup django settings for you, create database, then run test. After that you can easy start server with `make run` command.

