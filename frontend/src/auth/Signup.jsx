import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    countryCode: "+91",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      phone: `${form.countryCode}${form.phone}`,
    };

    try {
      const res = await fetch(`${backendUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      navigate("/login");
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT SAME */}
      <div className="auth-left">
        <div className="logo">
          <img src="/icon.png" alt="logo" />
          <span>VocodeAI</span>
        </div>

        <h1>Welcome to VocodeAI</h1>
        <p>Your AI-powered coding workspace</p>

        <div className="terminal-box">
          <div className="dots">
            <span className="red"></span>
            <span className="yellow"></span>
            <span className="green"></span>
          </div>
          <pre>
{`>_ $ vocode init
Initializing AI workspace...

✨ Ready to code smarter`}
          </pre>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="sub-text">
            Get started with your AI coding workspace.
          </p>

          <button
            className="google-btn"
            onClick={() =>
              (window.location.href = `${backendUrl}/api/auth/google`)
            }
          >
            <img src="/google.png" alt="google" />
            Continue with Google
          </button>

          <div className="divider">
            <span>or continue with email</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={submit}>
            <label>Full Name</label>
            <input
              name="firstName"
              placeholder="John Doe"
              onChange={handleChange}
            />

            <label>Email</label>
            <input
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              onChange={handleChange}
            />

            <button className="primary-btn" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <p className="switch">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}