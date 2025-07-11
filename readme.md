# 📚 Library SPA (Single Page Application)

This project is a web-based Single Page Application (SPA) for managing a library system. It allows administrators to manage books (add, edit, delete, view), and users to reserve books.

## 🚀 Features

- User and Admin login & registration.
- Role-based authentication (`admin` and `user`).
- Admins can:
  - Add new books.
  - Edit existing books.
  - Delete books.
  - View all reservations.
- Users can:
  - View available books.
  - Reserve books.
  - View their reservations.
- Dynamic routing and navigation without page reloads.

## 💠 Technologies Used

- **HTML5** / **CSS3** / **JavaScript**
- **JSON Server** for mock REST API
- **Boxicons** for UI icons

## 📁 Project Structure

```
/img                → Icons and images
/scripts            → JavaScript logic (SPA routing, auth, CRUD)
/styles             → CSS styles
/views              → HTML views for each route (books, login, register, etc.)
index.html          → Main layout containing SPA container
db.json             → JSON Server database
```

## ▶️ Getting Started

1. **Install JSON Server globally (if not already):**

```bash
npm install -g json-server
```

2. **Run JSON Server with your database:**

```bash
json-server --watch db.json
```

3. **Open ****\`\`**** in your browser** (use Live Server for best experience).

## 🔐 Roles

- **Admin:**
  - Full access to book management and reservations.
- **User:**
  - Can only view and reserve books.

## 📌 Notes

- Admin accounts include an `isAdmin: true` field in `db.json`.
- Reservations are saved in a separate `/reservations` endpoint.

## ✨ Author

Developed by Sharon Ortiz as part of a personal or academic project.\*\*

