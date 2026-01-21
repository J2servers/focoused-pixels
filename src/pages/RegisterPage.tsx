import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// RegisterPage redirects to LoginPage with signup mode
// This provides a clean URL for the signup flow while reusing the same component
const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page - the login page handles both login and signup
    navigate('/login?mode=signup', { replace: true });
  }, [navigate]);

  return null;
};

export default RegisterPage;
