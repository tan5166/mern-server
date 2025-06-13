# Course Management Platform

A simple course management platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js), allowing instructors to create courses and students to enroll in them.

## Features

### For Instructors

- Register as an instructor
- Create courses with basic information:
  - Title
  - Category
  - Price
- View total earnings from their courses
- View all courses they've created

### For Students

- Register as a student
- Browse available courses
- Enroll in courses
- View enrolled courses

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB Atlas (Cloud Database)
- JWT Authentication
- Passport.js for authentication strategies
- Mongoose for ODM

### Frontend (Separate Repository)

- React.js
- React Router for navigation
- Axios for API calls
- JWT for authentication

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user (instructor/student)
- `POST /api/auth/login` - User login
- `POST /api/auth/update-password` - Update user password

### Courses

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get specific course
- `POST /api/courses` - Create new course (instructor only)
- `PATCH /api/courses/:id` - Update course (instructor only)
- `DELETE /api/courses/:id` - Delete course (instructor only)
- `GET /api/courses/enrolled` - Get enrolled courses (student only)
- `GET /api/courses/total-earnings` - Get total earnings (instructor only)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd server
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
PORT=8080
```

4. Run the development server

```bash
npm start
```

### Database Seeding

To populate the database with sample data:

```bash
npm run seed
```

This will create:

- 5 instructors
- 10 students
- 15 sample courses

Default login credentials for seeded users:

- Email: instructor1@test.com, student1@test.com, etc.
- Password: password123

## Project Structure

```
server/
├── config/         # Configuration files
├── models/         # Mongoose models
├── routes/         # API routes
├── utils/          # Utility functions
├── index.js        # Entry point
└── package.json    # Project dependencies
```

## Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control (instructor/student)
- Protected routes for sensitive operations

## Future Improvements

- Add video content support
- Implement course ratings and reviews
- Add payment integration
- Implement course search and filtering
- Add user profiles and avatars
- Implement course progress tracking

## License

This project is licensed under the MIT License.
