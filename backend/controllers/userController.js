/**
 * User Controller
 * 
 * This controller handles all user-related business logic including:
 * - User CRUD operations
 * - Authentication logic
 * - Input validation
 * - Data transformation
 */

const { APIError } = require('../middleware/errorHandler');

// Mock data store (replace with actual database in production)
let users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: new Date('2023-01-16'),
    updatedAt: new Date('2023-01-16')
  }
];

let nextId = 3;

/**
 * Get all users with pagination and filtering
 */
const getAllUsers = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  // Filter users based on search term
  let filteredUsers = users;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }

  // Sort users
  filteredUsers.sort((a, b) => {
    const aVal = a[sort];
    const bVal = b[sort];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Apply pagination
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Calculate pagination metadata
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / limitNum);

  res.json({
    users: paginatedUsers,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalUsers,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      limit: limitNum
    },
    filters: {
      search,
      sort,
      order
    }
  });
};

/**
 * Get a specific user by ID
 */
const getUserById = async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    throw new APIError('Invalid user ID format', 400);
  }

  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new APIError('User not found', 404);
  }

  res.json({
    user
  });
};

/**
 * Create a new user
 */
const createUser = async (req, res) => {
  const { name, email } = req.body;

  // Validate required fields
  if (!name || !email) {
    throw new APIError('Name and email are required', 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new APIError('Invalid email format', 400);
  }

  // Check if email already exists
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    throw new APIError('Email already exists', 409);
  }

  // Create new user
  const newUser = {
    id: nextId++,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users.push(newUser);

  res.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
};

/**
 * Update an existing user
 */
const updateUser = async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id);
  const { name, email } = req.body;

  if (isNaN(userId)) {
    throw new APIError('Invalid user ID format', 400);
  }

  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new APIError('User not found', 404);
  }

  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new APIError('Invalid email format', 400);
    }

    // Check if email already exists (excluding current user)
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId);
    if (existingUser) {
      throw new APIError('Email already exists', 409);
    }
  }

  // Update user
  const updatedUser = {
    ...users[userIndex],
    ...(name && { name: name.trim() }),
    ...(email && { email: email.toLowerCase().trim() }),
    updatedAt: new Date()
  };

  users[userIndex] = updatedUser;

  res.json({
    message: 'User updated successfully',
    user: updatedUser
  });
};

/**
 * Delete a user
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    throw new APIError('Invalid user ID format', 400);
  }

  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new APIError('User not found', 404);
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  res.json({
    message: 'User deleted successfully',
    user: deletedUser
  });
};

/**
 * User login (mock implementation)
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new APIError('Email and password are required', 400);
  }

  // Mock authentication - in production, you would:
  // 1. Hash the password
  // 2. Compare with stored hash
  // 3. Generate JWT token
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || password !== 'password123') { // Mock password check
    throw new APIError('Invalid email or password', 401);
  }

  // Mock JWT token (in production, use jsonwebtoken library)
  const token = `mock_jwt_token_${user.id}_${Date.now()}`;

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    token
  });
};

/**
 * User logout
 */
const logout = async (req, res) => {
  // In production, you might:
  // 1. Blacklist the JWT token
  // 2. Clear session data
  // 3. Log the logout event
  
  res.json({
    message: 'Logout successful'
  });
};

/**
 * Get current user's profile
 */
const getMyProfile = async (req, res) => {
  // In production, you would get user from JWT token
  // For now, return a mock response
  const userId = req.user?.id || 1; // Mock user ID
  
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new APIError('User not found', 404);
  }

  res.json({
    user
  });
};

/**
 * Update current user's profile
 */
const updateMyProfile = async (req, res) => {
  // In production, you would get user from JWT token
  const userId = req.user?.id || 1; // Mock user ID
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new APIError('User not found', 404);
  }

  const { name, email } = req.body;

  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new APIError('Invalid email format', 400);
    }

    // Check if email already exists (excluding current user)
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId);
    if (existingUser) {
      throw new APIError('Email already exists', 409);
    }
  }

  // Update user
  const updatedUser = {
    ...users[userIndex],
    ...(name && { name: name.trim() }),
    ...(email && { email: email.toLowerCase().trim() }),
    updatedAt: new Date()
  };

  users[userIndex] = updatedUser;

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  logout,
  getMyProfile,
  updateMyProfile
};
