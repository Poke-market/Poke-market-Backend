document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register-form");
  const passwordInput = document.getElementById("password");
  const passwordConfirmInput = document.getElementById("password-confirm");
  const passwordFeedback = document.getElementById("password-feedback");

  function validatePassword() {
    const password = passwordInput.value;
    let isValid = true;
    let feedback = "";

    if (password.length < 8 || password.length > 25) {
      feedback += "• Password must be 8-25 characters<br>";
      isValid = false;
    }

    if (!/[A-Z]/.test(password)) {
      feedback += "• Must contain at least one uppercase letter<br>";
      isValid = false;
    }

    if (!/[a-z]/.test(password)) {
      feedback += "• Must contain at least one lowercase letter<br>";
      isValid = false;
    }

    if (!/[0-9]/.test(password)) {
      feedback += "• Must contain at least one digit<br>";
      isValid = false;
    }

    if (!/[!@#$%^&*]/.test(password)) {
      feedback +=
        "• Must contain at least one special character (!@#$%^&*)<br>";
      isValid = false;
    }

    passwordFeedback.innerHTML = feedback;
    return isValid;
  }

  function checkPasswordsMatch() {
    if (passwordInput.value !== passwordConfirmInput.value) {
      passwordConfirmInput.setCustomValidity("Passwords don't match");
    } else {
      passwordConfirmInput.setCustomValidity("");
    }
  }

  passwordInput.addEventListener("input", validatePassword);
  passwordConfirmInput.addEventListener("input", checkPasswordsMatch);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    if (passwordInput.value !== passwordConfirmInput.value) {
      alert("Passwords don't match");
      return;
    }

    const userData = {
      email: document.getElementById("email").value,
      password: passwordInput.value,
      firstname: document.getElementById("firstname").value,
      lastname: document.getElementById("lastname").value,
      city: document.getElementById("city").value,
      street: document.getElementById("street").value,
      housenumber: document.getElementById("housenumber").value,
      zipcode: document.getElementById("zipcode").value,
      telephone: document.getElementById("telephone").value,
      isAdmin: true,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Registration failed: ${data.message || "Please try again"}`);
        return;
      }

      const token = data.data.token;
      if (token) {
        document.cookie = `token=${token}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24).toUTCString()}`;
      }

      alert("Admin user registered successfully!");
      window.location.href = "/items";
    } catch (error) {
      alert("Registration error: " + error);
    }
  });
});
