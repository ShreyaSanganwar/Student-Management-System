const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Student Database Structure
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      default: '',
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    photo: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model('Student', studentSchema);

// Home route
app.get('/', (req, res) => {
  res.send('Student Management Backend is running!');
});

// Test route
app.get('/test', (req, res) => {
  res.send('Test route is working!');
});

// Get all students + Search

 // First Admin Registration
app.post('/api/auth/setup-admin', async (req, res) => {
  try {
    const { name, email, password, setupKey } = req.body;

    // Check setup secret
    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({
        message: 'Invalid admin setup key'
      });
    }

    // Only one initial admin can be created
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      return res.status(403).json({
        message: 'Admin account already exists'
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please fill all required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'admin'
    });

    const token = createToken(admin);

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please enter email and password'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = createToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Student Registration
app.post('/api/auth/register', async (req, res) => {
  try {
   const { name, email, password, dob } = req.body;

   if (!name || !email || !password || !dob) {
      return res.status(400).json({
        message: 'Please fill all required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
  name: name.trim(),
  email: email.trim().toLowerCase(),
  password: hashedPassword,
  dob: dob,
  role: 'student'
});

    const token = createToken(user);

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all registered students for Admin
app.get('/api/registered-students', async (req, res) => {
  try {
    const students = await User.find(
      { role: 'student' },
      '-password'
    ).sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});
// Get all registered students for Admin
app.get('/api/registered-students', async (req, res) => {
  try {
    const students = await User.find(
      { role: 'student' },
      '-password'
    ).sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});
app.get('/api/students', async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );

      filter = {
        $or: [
          { name: searchRegex },
          { course: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      };
    }

    const students = await Student.find(filter).sort({
      createdAt: -1
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Add a student
app.post('/api/students', async (req, res) => {
  try {
    const { name, course, email, phone, photo } = req.body;

    if (!name || !name.trim() || !course || !course.trim()) {
      return res.status(400).json({
        message: 'Student name and course are required'
      });
    }

    const student = new Student({
      name,
      course,
      email: email || '',
      phone: phone || '',
      photo: photo || ''
    });

    const savedStudent = await student.save();

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Edit / Update a student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { name, course, email, phone, photo } = req.body;

    if (!name || !name.trim() || !course || !course.trim()) {
      return res.status(400).json({
        message: 'Student name and course are required'
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name,
        course,
        email: email || '',
        phone: phone || '',
        photo: photo || ''
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Delete a student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!deletedStudent) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    res.json({
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully!');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('MongoDB Connection Error:', error.message);
  });
