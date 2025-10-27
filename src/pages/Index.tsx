import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard on index page load
    navigate('/dashboard');
  }, [navigate]);

  return null;
};

export default Index;
