Engineering Decisions:
1) Created database tables: users, notes, notecategory, and category(notes and cateogry has user_id has foregin key as they are related to user), notecategory defines many to many reln between notes and category
2) Used sequelize orm to interact with mysql database
3) Password are hased using bcryt, used jwt authentication
4) Followed RESTful api conventions

Setup Instructions:
clone the repo:
react frontend setup:
cd client

node backend setup
cd server

