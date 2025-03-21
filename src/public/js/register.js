document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register-form");
  const passwordInput = document.getElementById("password");
  const passwordConfirmInput = document.getElementById("password-confirm");
  const passwordFeedback = document.getElementById("password-feedback");
  const notificationArea = document.getElementById("notification-area");
  const submitButton = form.querySelector("button[type='submit']");
  const originalButtonText = submitButton.textContent;

  // Track notification visibility state
  let isNotificationVisible = false;

  // Clear all field error messages
  const clearErrors = () => {
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
    });
  };

  // Clear a specific field error
  const clearFieldError = (field) => {
    const errorElement = document.getElementById(`${field}-error`);
    if (errorElement) {
      errorElement.textContent = "";
    }
  };

  // Clear notification
  const clearNotification = () => {
    notificationArea.classList.remove("visible");
    notificationArea.textContent = "";
    isNotificationVisible = false;
  };

  // Show an error in the notification area
  const showNotification = (message, type = "error") => {
    // Update content
    notificationArea.innerHTML = message;
    notificationArea.className = `notification ${type} visible`;
    isNotificationVisible = true;

    if (type === "error" || type === "loading") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Show a field error
  const showFieldError = (field, message) => {
    const errorElement = document.getElementById(`${field}-error`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  };

  // Set button to loading state
  const setLoadingState = (isLoading, message = "Processing...") => {
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.textContent = message;
    } else {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  };

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
      showFieldError("password-confirm", "Passwords don't match");
      return false;
    } else {
      showFieldError("password-confirm", "");
      return true;
    }
  }

  // Add input event listeners to all form fields to clear their errors on input
  const formFields = [
    "email",
    "firstname",
    "lastname",
    "street",
    "housenumber",
    "city",
    "zipcode",
    "telephone",
  ];

  formFields.forEach((field) => {
    const fieldInput = document.getElementById(field);
    if (fieldInput) {
      fieldInput.addEventListener("input", () => {
        clearFieldError(field);
      });
    }
  });

  // Special case for password input - keeps validation but clears error message
  passwordInput.addEventListener("input", () => {
    validatePassword();
    clearFieldError("password");
  });

  // Special case for password confirmation - check if passwords match
  passwordConfirmInput.addEventListener("input", () => {
    checkPasswordsMatch();
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Clear field errors
    clearErrors();

    // Check passwords match
    if (!checkPasswordsMatch()) {
      showNotification("Passwords don't match.", "error");
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
    };

    try {
      // Show loading button state
      setLoadingState(true, "Processing registration...");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      // Reset button state
      setLoadingState(false);

      // Check for errors
      if (!response.ok) {
        // Find new error message
        let newErrorMessage = null;

        // Check for already registered users
        if (data.data && data.data.errors) {
          // Handle field errors and notification
          if (Array.isArray(data.data.errors)) {
            data.data.errors.forEach((err) => {
              if (Array.isArray(err)) {
                // Field error [field, message]
                const [field, message] = err;
                showFieldError(field, message);
              } else {
                // General error (string)
                newErrorMessage = newErrorMessage
                  ? `${newErrorMessage}<br>${err}`
                  : err;
              }
            });
          } else {
            newErrorMessage = data.data.errors.join("<br>");
          }
        } else {
          newErrorMessage =
            data.message || "Registration failed. Please try again.";
        }

        // Show notification if we have errors
        if (newErrorMessage) {
          showNotification(
            `Registration failed:<br>${newErrorMessage}`,
            "error",
          );
        } else {
          clearNotification();
        }

        return;
      }

      // Clear the form
      form.reset();

      // Hide the form and show success container
      document.getElementById("register-form").style.display = "none";
      document.querySelector(".login-link").style.display = "none";

      const successContainer = document.getElementById("success-container");
      const successMessage = document.getElementById("success-message");

      // Display success message
      successMessage.innerHTML = `
        <p>A verification email has been sent to <strong>${userData.email}</strong>.</p>
        <p>Please check your inbox and follow the verification link to activate your account.</p>
      `;

      // Show the success container
      successContainer.style.display = "block";

      // Scroll to top to show the success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Registration error:", error);
      setLoadingState(false);
      showNotification("Registration error: " + error, "error");
    }
  });
});
