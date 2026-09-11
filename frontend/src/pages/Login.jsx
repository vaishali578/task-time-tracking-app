import authStore from "../store/authStore";

const Login = () => {
  const { user, token, login, logout } = authStore();

  const handleTestLogin = () => {
    login(
      {
        id: "123",
        name: "Vaishali",
        email: "vaishali@example.com",
      },
      "sample-jwt-token"
    );
  };

  return (
    <div>
      <h1>Login Page</h1>

      <button onClick={handleTestLogin}>
        Test Login
      </button>

      <button onClick={logout}>
        Logout
      </button>

      <p>User: {user?.name || "Not logged in"}</p>

      <p>Token: {token || "No token"}</p>
    </div>
  );
};

export default Login;