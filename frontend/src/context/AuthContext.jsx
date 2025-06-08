import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode for decoding JWT tokens

// Create AuthContext to share authentication state across components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State to hold authenticated user info: { token, id, username, role }
  const [user, setUser] = useState(null);

  // State to track whether the initial auth check/loading is done
  const [authLoading, setAuthLoading] = useState(true);

  // Effect runs once on component mount to load user info from localStorage
  useEffect(() => {
    setAuthLoading(true);

    // Retrieve JWT token from localStorage if it exists
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      try {
        // Decode the token to extract user details and expiration time
        const decodedUser = jwtDecode(storedToken);

        // Optional: Check if token is expired (token exp is in seconds)
        const currentTime = Date.now() / 1000;
        if (decodedUser.exp < currentTime) {
          // Token expired: clear stored token and reset user state
          console.log("Token expired, removing from storage.");
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Token valid: set user state with decoded info and token
          setUser({
            token: storedToken,
            id: decodedUser.id,
            username: decodedUser.username,
            role: decodedUser.role
          });
        }
      } catch (error) {
        // Token invalid or corrupted: remove and reset user state
        console.error("Failed to decode token from localStorage:", error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }

    // Mark auth check/loading as finished
    setAuthLoading(false);
  }, []);

  // Login function to set user after successful authentication
  // Expects a JWT token string, decodes it, saves token and user info in state and localStorage
  const login = (token) => {
    try {
      const decodedUser = jwtDecode(token);

      // Save token to localStorage for persistence
      localStorage.setItem('token', token);

      // Update user state with decoded data
      setUser({
        token,
        id: decodedUser.id,
        username: decodedUser.username,
        role: decodedUser.role
      });
    } catch (error) {
      // Handle invalid token errors during login
      console.error("Failed to process token on login:", error);
      // Optionally, add error handling UI here
    }
  };
  
  // Logout function clears token and user state
  const logout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setUser(null);                    // Reset user state
    // Optionally, redirect user to login page here if needed
  };

  // Provide context values: current user, login/logout functions, auth loading status
  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
