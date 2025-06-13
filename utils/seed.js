const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/user-model");
const Course = require("../models/course-model");

dotenv.config();

const seedData = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI).then(() => {
      console.log("Successfully connected to MongoDB!");
    });

    // 2. Clear existing data
    console.log("Clearing users and courses collections...");
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log("Collections cleared.");

    // 3. Create users
    console.log("Creating users...");
    const plainPassword = "password123";

    const instructorNames = [
      "Dan Smith",
      "Charlie Brown",
      "Alice Johnson",
      "Bob Williams",
      "Eve Davis",
    ];
    const studentNames = [
      "John Miller",
      "Jane Garcia",
      "Jim Rodriguez",
      "Sarah Wilson",
      "Mike Martinez",
      "Emily Anderson",
      "David Taylor",
      "Laura Thomas",
      "Chris Moore",
      "Olivia Jackson",
    ];

    const userDataSet = [
      // Instructors
      ...instructorNames.map((name, i) => ({
        username: name,
        email: `instructor${i + 1}@test.com`,
        password: plainPassword,
        role: "instructor",
      })),
      // Students
      ...studentNames.map((name, i) => ({
        username: name,
        email: `student${i + 1}@test.com`,
        password: plainPassword,
        role: "student",
      })),
    ];

    const users = await User.create(userDataSet);
    console.log(`${users.length} users created.`);

    const instructors = users.filter((u) => u.role === "instructor");
    const students = users.filter((u) => u.role === "student");

    // 4. Create courses
    console.log("Creating courses...");
    const courseDataSet = [
      {
        title: "Introduction to React",
        category: "Web Development",
        price: 99.99,
      },
      { title: "Advanced Node.js", category: "Web Development", price: 149.99 },
      {
        title: "Data Science with Python",
        category: "Data Science",
        price: 199.99,
      },
      {
        title: "UI/UX Design Principles",
        category: "UI/UX Design",
        price: 79.99,
      },
      {
        title: "Getting Started with Docker",
        category: "DevOps",
        price: 129.99,
      },
      {
        title: "Mobile App Development with Flutter",
        category: "Mobile Development",
        price: 159.99,
      },
      { title: "Machine Learning A-Z", category: "AI", price: 249.99 },
      {
        title: "Cybersecurity Fundamentals",
        category: "Cybersecurity",
        price: 119.99,
      },
      {
        title: "Unity Game Development",
        category: "Game Development",
        price: 179.99,
      },
      {
        title: "AWS Certified Cloud Practitioner",
        category: "Cloud Computing",
        price: 89.99,
      },
      { title: "Blockchain Basics", category: "Blockchain", price: 139.99 },
      {
        title: "Digital Marketing Masterclass",
        category: "Digital Marketing",
        price: 109.99,
      },
      {
        title: "Advanced CSS and Sass",
        category: "Web Development",
        price: 99.99,
      },
      {
        title: "SQL for Data Analysts",
        category: "Data Science",
        price: 119.99,
      },
      {
        title: "Introduction to TypeScript",
        category: "Web Development",
        price: 89.99,
      },
    ];

    const coursesToCreate = courseDataSet.map((course, index) => {
      // Assign instructor randomly
      const instructor = instructors[index % instructors.length];
      // Assign a random number of students
      const numStudents = Math.floor(Math.random() * (students.length + 1));
      const shuffledStudents = students.sort(() => 0.5 - Math.random());
      const enrolledStudents = shuffledStudents
        .slice(0, numStudents)
        .map((s) => s._id);

      return {
        ...course,
        instructor: instructor._id,
        students: enrolledStudents,
      };
    });

    const courses = await Course.create(coursesToCreate);
    console.log(`${courses.length} courses created.`);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // 5. Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

seedData();
