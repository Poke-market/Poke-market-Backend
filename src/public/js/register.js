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
    // Safety check to ensure elements exist
    if (!passwordInput || !passwordFeedback) {
      console.error("Password input or feedback elements not found");
      return false;
    }

    const password = passwordInput.value;
    const feedback = [];
    let isValid = true;

    // Check password requirements
    if (password.length < 8) {
      feedback.push("Password must be at least 8 characters long");
      isValid = false;
    }
    if (password.length > 25) {
      feedback.push("Password must be less than 25 characters");
      isValid = false;
    }
    if (!/[A-Z]/.test(password)) {
      feedback.push("Password must include at least one uppercase letter");
      isValid = false;
    }
    if (!/[a-z]/.test(password)) {
      feedback.push("Password must include at least one lowercase letter");
      isValid = false;
    }
    if (!/[0-9]/.test(password)) {
      feedback.push("Password must include at least one number");
      isValid = false;
    }
    if (!/[!@#$%^&*]/.test(password)) {
      feedback.push(
        "Password must include at least one special character (!@#$%^&*)",
      );
      isValid = false;
    }

    if (feedback.length > 0) {
      passwordFeedback.innerHTML = feedback
        .map((msg) => `<div class="feedback-item">${msg}</div>`)
        .join("");
      passwordFeedback.style.display = "block";

      // Add orange warning border while there are validation issues
      passwordInput.classList.add("password-warning");
      passwordInput.classList.remove("invalid"); // Remove red border if present
    } else {
      // Hide feedback div when all requirements are met
      passwordFeedback.innerHTML = "";
      passwordFeedback.style.display = "none";

      // Remove orange warning border when requirements are met
      passwordInput.classList.remove("password-warning");
    }

    return isValid;
  }

  function checkPasswordsMatch() {
    // Safety check to ensure elements exist
    if (!passwordInput || !passwordConfirmInput) {
      console.error("Password input elements not found");
      return false;
    }

    const password = passwordInput.value;
    const confirmPassword = passwordConfirmInput.value;
    const errorDiv = document.getElementById("password-confirm-error");

    if (!errorDiv) {
      console.error("Password confirm error element not found");
      return false;
    }

    if (password !== confirmPassword) {
      errorDiv.textContent = "Passwords do not match";
      // Use warning style instead of error for password mismatches
      passwordConfirmInput.classList.add("password-warning");
      passwordConfirmInput.classList.remove("invalid");
      errorDiv.classList.add("warning-message");
      errorDiv.classList.remove("error-message");
      return false;
    } else {
      errorDiv.textContent = "";
      passwordConfirmInput.classList.remove("password-warning");
      // Reset message classes
      errorDiv.classList.remove("warning-message");
      errorDiv.classList.add("error-message");
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
  });

  // Special case for password confirmation - check if passwords match
  passwordConfirmInput.addEventListener("input", () => {
    if (passwordInput.value && passwordConfirmInput.value) {
      checkPasswordsMatch();
    } else {
      clearFieldError("password-confirm");
    }
  });

  // Show password requirements when field is focused
  passwordInput.addEventListener("focus", () => {
    validatePassword();
  });

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Clear field errors
    clearErrors();
    clearNotification();

    // Validate all required fields
    let isValid = true;
    let firstErrorField = null;

    // Required fields
    const requiredFields = [
      "email",
      "firstname",
      "lastname",
      "street",
      "housenumber",
      "city",
      "zipcode",
      "telephone",
      "password",
      "password-confirm",
    ];

    // Check for empty required fields
    requiredFields.forEach((field) => {
      const input = document.getElementById(field);
      if (!input || !input.value.trim()) {
        const errorDiv = document.getElementById(`${field}-error`);
        if (errorDiv) {
          errorDiv.textContent = "This field is required";
          errorDiv.classList.add("error-message");
          errorDiv.classList.remove("warning-message");
          isValid = false;
          firstErrorField ??= field;
          input?.classList.add("invalid");
        }
      }
    });

    // Email validation
    const emailInput = document.getElementById("email");
    if (
      emailInput &&
      emailInput.value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)
    ) {
      document.getElementById("email-error").textContent =
        "Please enter a valid email address";
      emailInput.classList.add("invalid");
      isValid = false;
      firstErrorField ??= "email";
    }

    // Validate password
    if (!validatePassword()) {
      isValid = false;
      firstErrorField ??= "password";
    }

    // Check passwords match
    if (!checkPasswordsMatch()) {
      isValid = false;
      firstErrorField ??= "password-confirm";
    }

    // If form is not valid, focus on the first error field and stop submission
    if (!isValid) {
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    // Form is valid, proceed with submission
    try {
      // Show loading button state
      setLoadingState(true, "Processing registration...");

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
