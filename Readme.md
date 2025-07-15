# Notes App

## Engineering Decisions:

1) Created database tables: `users`, `notes`, `notecategory`, and `category`.  
   - `notes` and `category` have `user_id` as a foreign key since they are related to the user.  
   - `notecategory` defines a many-to-many relationship between `notes` and `category`.

2) Used Sequelize ORM to interact with the MySQL database.

3) Passwords are hashed using bcrypt.  
   - JWT authentication is used.  
   - Middleware is set up for authorization.

4) Followed RESTful API conventions for all the APIs.

---

## Setup Instructions:

### Clone the repo:

```bash
git clone <repository-url>
```

---

### React frontend setup:

```bash
cd client
npm install
npm run dev
```

---

### Node backend setup:

```bash
cd server
```

Create a `.env` file and add:

```env
JWT_SECRET="your_jwt_secret"
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=notesapp
```

Then run:

```bash
npm install
node server.js
```

⚠️ Make sure to **set up the database** before running the server.

---

### Database setup:

- Install MySQL locally
- Open your MySQL CLI or GUI and run:

```sql
CREATE DATABASE notesapp;
```

---
