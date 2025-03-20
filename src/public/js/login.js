document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      alert("Login failed");
      return;
    }
    const data = await response.json();
    const token = data.token;
    document.cookie = `token=${token}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24)}`;
    window.location.href = "/items";
  } catch (error) {
    alert("Login error: " + error);
  }
});

//if a token is present redirect to items
const token = document.cookie
  .split(";")
  .find((cookie) => cookie.startsWith("token="));
if (token) {
  window.location.href = "/items";
}
