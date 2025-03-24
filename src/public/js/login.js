document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const notificationArea = document.getElementById("notification-area");
  const submitButton = loginForm.querySelector("button[type='submit']");
  const originalButtonText = submitButton.textContent;

  // Track notification visibility state
  let isNotificationVisible = false;

  // Clear all error messages
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
  };

  // Show a field error
  const showFieldError = (field, message) => {
    const errorElement = document.getElementById(`${field}-error`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  };

  // Set button to loading state
  const setLoadingState = (isLoading) => {
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.textContent = "Logging in...";
    } else {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  };

  // Add input event listeners to clear field errors when typing
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (emailInput) {
    emailInput.addEventListener("input", () => {
      clearFieldError("email");
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      clearFieldError("password");
    });
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Clear field errors
    clearErrors();

    // Store notification content before potentially clearing
    const currentNotification = notificationArea.textContent;

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Set button to loading state
    setLoadingState(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Login failed:", data);

        // Reset button state
        setLoadingState(false);

        // Find new error message
        let newErrorMessage = null;

        // Show errors
        if (data.data && data.data.errors) {
          data.data.errors.forEach((error) => {
            if (Array.isArray(error)) {
              // Field-specific error: [field, message]
              const [field, message] = error;
              showFieldError(field, message);
            } else {
              // General error (string)
              newErrorMessage = error;
            }
          });
        } else if (data.message) {
          // General API error message
          newErrorMessage = data.message;
        }

        // Handle notification
        if (newErrorMessage) {
          // If we have the same message as before, don't re-animate
          if (
            currentNotification === newErrorMessage &&
            isNotificationVisible
          ) {
            // Just ensure it's still visible
            notificationArea.classList.add("visible");
          } else {
            // Different message, update with potential animation
            showNotification(newErrorMessage);
          }
        }

        return;
      }

      // Success case - clear any notifications
      if (isNotificationVisible) {
        clearNotification();
      }

      // Redirect on success
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);

      // Reset button state
      setLoadingState(false);

      // Show error notification
      showNotification("Connection error. Please try again.");
    }
  });
});
