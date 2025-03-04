import { useState, useEffect } from "react";
import "./SignupForm.css";
import logo from "../assets/sparklogo.png";
import banner from "../assets/banner.png";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

function SignupForm() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const VITE_BACK_URL = import.meta.env.VITE_BACK_URL;

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (touched.firstname && !formData.firstname) newErrors.firstname = "First name is required";
    if (touched.lastname && !formData.lastname) newErrors.lastname = "Last name is required";
    if (touched.email) {
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    }
    if (touched.password) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (!passwordRegex.test(formData.password))
        newErrors.password = "Please choose a strong password that includes at least 1 lowercase and uppercase letter, a number, as well as a special character (!@#$%^&*)";
    }
    if (touched.confirmPassword && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    setIsValid(validateForm() && isChecked);
  }, [formData, isChecked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      firstname: true,
      lastname: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (validateForm()) {
      try {
        console.log("Submitting signup form...");
        const res = await axios.post(`${VITE_BACK_URL}/signup`, formData);
        console.log("Signup response:", res.data);
        localStorage.setItem("token", res.data.token);
        localStorage.removeItem("categoryCompleted"); // Ensure this is cleared
        console.log("Token set in localStorage:", localStorage.getItem("token"));
        console.log("categoryCompleted cleared:", localStorage.getItem("categoryCompleted"));
        navigate("/login", { replace: true });
        console.log("Navigated to /login");
      } catch (error) {
        console.error("Signup error:", error);
        setErrors({
          general: error.response?.data?.message || "Something went wrong",
        });
      }
    }
  };

  return (
    <div className="container4">
      <div className="logo-container">
        <img src={logo} alt="Spark logo" />
      </div>
      <div className="signup-container">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>Sign up to your Spark</h1>
        <div className="signup-text">
          <h2>Create an account</h2>
          <NavLink to="/login" className="submit-btn">Sign in instead</NavLink>
        </div>
        <form onSubmit={handleSubmit} className="signup-form">
          {errors.general && <div className="error">{errors.general}</div>}
          <div className="form-group">
            <label htmlFor="firstname">First Name</label>
            <input type="text" id="firstname" name="firstname" value={formData.firstname} onChange={handleChange} onBlur={handleBlur} />
            {touched.firstname && errors.firstname && <span className="error">{errors.firstname}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="lastname">Last Name</label>
            <input type="text" id="lastname" name="lastname" value={formData.lastname} onChange={handleChange} onBlur={handleBlur} />
            {touched.lastname && errors.lastname && <span className="error">{errors.lastname}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} />
            {touched.email && errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} />
            {touched.password && errors.password && <span className="error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} />
            {touched.confirmPassword && errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>
          <div className="terms-group">
            <input type="checkbox" id="terms" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
            <label htmlFor="terms">I agree to the Terms and Conditions</label>
          </div>
          <button type="submit" className={`submit-btn ${isValid ? "active" : "disabled"}`} disabled={!isValid}>Create an account</button>
        </form>
      </div>
      <div style={{ margin: 0, padding: 0, display: "flex", justifyContent: "flex-end", height: "100vh" }}>
        <img src={banner} alt="Spark banner" className="signup-banner" />
      </div>
    </div>
  );
}

export default SignupForm;