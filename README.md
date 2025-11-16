# 🔐 Authentication & Authorization

## 🚀 Features

- **User Registration & Login** using Passport.js
- **Local Strategy Authentication**
- **Password Hashing** using bcrypt
- **MongoDB (Mongoose)** for user data storage
- **Session Management** using express-session
- **Protected Routes** for logged‑in users
- **Access Control** (only authorized users can view certain pages)

---

## 🛠️ Tech Stack

| Technology      | Usage                     |
| --------------- | ------------------------- |
| **Node.js**     | Backend runtime           |
| **Express.js**  | API & routing             |
| **MongoDB**     | Database                  |
| **Mongoose**    | ODM for MongoDB           |
| **Passport.js** | Authentication middleware |
| **bcrypt**      | Password hashing          |
| **EJS / HTML**  | Views (if used)           |

---

## 🔑 Authentication Flow

1. User registers with email + password
2. Password stored as **hashed value** (never plain text)
3. User logs in → Passport local strategy verifies credentials
4. Session created using **express-session**
5. Protected routes check `req.isAuthenticated()`

---

**Md Redwan**
