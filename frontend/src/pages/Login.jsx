import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { login as loginApiService } from '../services/authService'; // API call for login, renamed to avoid conflict with context login
import { useNavigate } from 'react-router-dom';

const Login = () => {
  // Destructure login function from AuthContext, aliased as loginContext to avoid naming conflict
  const { login: loginContext } = useContext(AuthContext);

  // Local state for form inputs: username and password
  const [form, setForm] = useState({ username: '', password: '' });

  // State to indicate if login request is in progress
  const [loading, setLoading] = useState(false);

  // State to hold any error message from login attempt
  const [error, setError] = useState('');

  // React Router's navigation hook to redirect after login
  const navigate = useNavigate();

  // Update form state when input values change
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();        // Prevent default form submission behavior
    setLoading(true);          // Start loading indicator
    setError('');              // Clear any previous error messages
    try {
      // Call backend API login service with username and password
      const res = await loginApiService(form.username, form.password);

      // Extract token from API response (assuming res.data.token)
      const token = res.data.token;

      // Use AuthContext login function to store token and update user state
      loginContext(token);

      // Redirect user to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      // If login fails, display error message from API or fallback text
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      // Stop loading indicator regardless of success or failure
      setLoading(false);
    }
  };

  return (
    // Centered container for login form with background styling
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          {/* Title and link to registration page */}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        {/* Login form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Username input */}
            <div>
              <input
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            {/* Password input */}
            <div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Display error message if login fails */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading} // Disable button while loading
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {/* Show loading text while waiting for API */}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
