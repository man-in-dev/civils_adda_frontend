// Frontend-only authentication storage utility

type User = {
  id: string;
  email: string;
  name: string;
  password: string; // Stored for demo purposes only (in production, never store passwords)
};

const USERS_KEY = "app_users";
const CURRENT_USER_KEY = "current_user";

// Simple hash function for demo (NOT secure, just for demo purposes)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

// Get all users from localStorage
function getUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save users to localStorage
function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Create a new user
export function createUser(email: string, password: string, name: string = ""): User {
  const users = getUsers();
  
  // Check if user already exists
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email already exists");
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    password: simpleHash(password), // Store hashed password
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// Authenticate user
export function authenticateUser(email: string, password: string): User | null {
  const users = getUsers();
  const emailLower = email.toLowerCase().trim();
  const passwordHash = simpleHash(password);

  const user = users.find(
    u => u.email === emailLower && u.password === passwordHash
  );

  if (user) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  return null;
}

// Get current user
export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Set current user
export function setCurrentUser(user: User): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// Clear current user
export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Generate a simple token (just user ID for demo)
export function generateToken(userId: string): string {
  // In a real app, this would be a JWT or session token
  // For demo, we'll just use a simple token format
  return `demo_token_${userId}_${Date.now()}`;
}

// Verify token (simple check for demo)
export function verifyToken(token: string): string | null {
  // Extract userId from token
  const match = token.match(/demo_token_(.+?)_/);
  return match ? match[1] : null;
}

