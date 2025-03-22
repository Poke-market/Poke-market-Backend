document.addEventListener("DOMContentLoaded", () => {
  initFormSubmission();
  initPasswordValidation();
  initCancelButton();
  initModalHandlers();
  initToggleSwitches();
  initInputListeners();
});

/**
 * Initialize form submission handling
 */
function initFormSubmission() {
  const form = document.getElementById("user-add-form");
  const saveBtn = document.getElementById("save-btn");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Ask for confirmation before creating the user
    showConfirmationModal(
      "Create New User?",
      "Are you sure you want to create this user account?",
      async () => {
        try {
          const formData = getFormData();

          // Show loading notification and set button state
          showNotification("loading", "Creating user...");
          setLoadingState(true);

          const response = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          const result = await response.json();

          // Reset button state
          setLoadingState(false);

          if (!response.ok) {
            // Handle server-side validation errors
            handleSubmitErrors(result);
            return;
          }

          // Show success notification and reset form
          showNotification("success", "User created successfully!");

          // Reset form to add another user
          resetForm(form);

          // Reset toggles to default state
          document.getElementById("isAdmin").checked = false;
          document.getElementById("isVerified").checked = false;
          initToggleSwitches(); // Refresh toggle displays
        } catch (error) {
          console.error("Error creating user:", error);
          setLoadingState(false);
          showNotification(
            "error",
            "An unexpected error occurred. Please try again.",
          );
        }
      },
    );
  });

  /**
   * Set button loading state
   * @param {boolean} loading Whether the button should show loading state
   */
  function setLoadingState(loading) {
    if (!saveBtn) return;

    if (loading) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Creating...";
    } else {
      saveBtn.disabled = false;
      saveBtn.textContent = "Create User";
    }
  }
}

/**
 * Handle validation errors from the API response
 * @param {Object} data The error response data
 */
function handleSubmitErrors(data) {
  // Clear any existing errors first
  clearAllErrors();

  let firstErrorField = null;

  if (data.errors || (data.data && data.data.errors)) {
    const errors = data.errors || data.data.errors;

    // Handle array of errors
    if (Array.isArray(errors)) {
      errors.forEach((err) => {
        if (Array.isArray(err)) {
          // Format: [field, message]
          const [field, message] = err;
          showFieldError(field, message);
          firstErrorField ??= field;
        } else if (err.field && err.message) {
          // Format: {field, message}
          showFieldError(err.field, err.message);
          firstErrorField ??= err.field;
        }
      });
    }
    // Handle object with field keys
    else if (typeof errors === "object") {
      Object.keys(errors).forEach((field) => {
        showFieldError(field, errors[field]);
        firstErrorField ??= field;
      });
    }

    showNotification("error", "Please correct the errors in the form.");

    // Scroll to first error field if there is one
    scrollToErrorField(firstErrorField);
  } else {
    // General error
    showNotification("error", data.message || "Failed to create user.");
  }
}

/**
 * Scroll to a field with error
 * @param {string} fieldName The name of the field to scroll to
 */
function scrollToErrorField(fieldName) {
  if (!fieldName) return;

  const field = document.getElementById(fieldName);
  if (!field) return;

  // Add a small delay to ensure DOM is ready
  setTimeout(() => {
    // Get the field's position relative to the viewport
    const rect = field.getBoundingClientRect();

    // Calculate position with offset - increased from 80 to 150 for more room
    const headerOffset = 200;
    const offsetPosition = window.pageYOffset + rect.top - headerOffset;

    // Scroll to the element
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    // Focus the field after scrolling completes
    setTimeout(() => {
      field.focus();

      // Add a temporary highlight effect
      field.classList.add("highlight-field");
      setTimeout(() => {
        field.classList.remove("highlight-field");
      }, 1500);
    }, 500);
  }, 100);
}

/**
 * Show a field error message
 * @param {string} field The field name
 * @param {string} message The error message
 */
function showFieldError(field, message) {
  const errorDiv = document.getElementById(`${field}-error`);
  const inputField = document.getElementById(field);

  if (errorDiv) {
    errorDiv.textContent = message;
  }

  // Add invalid class to the input field
  if (inputField) {
    inputField.classList.add("invalid");
  }
}

/**
 * Initialize input listeners to clear error messages when typing
 */
function initInputListeners() {
  // Required fields
  const fields = [
    "firstname",
    "lastname",
    "email",
    "password",
    // "confirm-password", // intentionally don't clear confirm password errors upon typing in it. This is so the user keeps seeing the "passwords do not match" error message until they fix it.
    "telephone",
    "street",
    "housenumber",
    "city",
    "zipcode",
  ];

  fields.forEach((field) => {
    const input = document.getElementById(field);
    if (input) {
      input.addEventListener("input", () => {
        clearFieldError(field);
      });
    }
  });
}

/**
 * Clear a field error message
 * @param {string} field The field name
 */
function clearFieldError(field) {
  const errorDiv =
    document.getElementById(`${field}-error`) ||
    document.getElementById(`${field.replace("-", "")}-error`);
  const inputField = document.getElementById(field);

  if (errorDiv) {
    console.log("test");
    errorDiv.textContent = "";
  }

  // Remove invalid class from the input field
  if (inputField) {
    inputField.classList.remove("invalid");
  }
}

/**
 * Clear all error messages
 */
function clearAllErrors() {
  // Clear all error messages
  document.querySelectorAll(".error-message").forEach((errorDiv) => {
    errorDiv.textContent = "";
  });

  // Remove invalid class from all inputs
  document.querySelectorAll(".form-input").forEach((input) => {
    input.classList.remove("invalid");
    input.classList.remove("password-warning");
  });
}

/**
 * Initialize password field validation with real-time feedback
 */
function initPasswordValidation() {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const feedbackDiv = document.getElementById("password-feedback");

  if (!passwordInput || !feedbackDiv) return;

  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    const feedback = [];

    // Check password requirements
    if (password.length < 8) {
      feedback.push("Password must be at least 8 characters long");
    }
    if (password.length > 25) {
      feedback.push("Password must be less than 25 characters");
    }
    if (!/[A-Z]/.test(password)) {
      feedback.push("Password must include at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      feedback.push("Password must include at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      feedback.push("Password must include at least one number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      feedback.push(
        "Password must include at least one special character (!@#$%^&*)",
      );
    }

    if (feedback.length > 0) {
      feedbackDiv.innerHTML = feedback
        .map((msg) => `<div class="feedback-item">${msg}</div>`)
        .join("");
      feedbackDiv.style.display = "block";

      // Add orange warning border while there are validation issues
      passwordInput.classList.add("password-warning");
      passwordInput.classList.remove("invalid"); // Remove red border if present
    } else {
      // Hide feedback div when all requirements are met
      feedbackDiv.innerHTML = "";
      feedbackDiv.style.display = "none";

      // Remove orange warning border when requirements are met
      passwordInput.classList.remove("password-warning");
    }

    // Check if confirm password needs to be updated too
    if (confirmPasswordInput && confirmPasswordInput.value) {
      checkPasswordsMatch();
    }
  });

  // Check if passwords match when confirm password is changed
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", checkPasswordsMatch);
  }

  /**
   * Check if passwords match and update UI accordingly
   */
  function checkPasswordsMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const errorDiv = document.getElementById("confirm-password-error");

    if (password !== confirmPassword) {
      errorDiv.textContent = "Passwords do not match";
      // Use warning style instead of error for password mismatches
      confirmPasswordInput.classList.add("password-warning");
      confirmPasswordInput.classList.remove("invalid");
      errorDiv.classList.add("warning-message");
      errorDiv.classList.remove("error-message");
    } else {
      console.log("Passwords match");
      errorDiv.textContent = "";
      confirmPasswordInput.classList.remove("password-warning");

      // Reset message classes
      errorDiv.classList.remove("warning-message");
      errorDiv.classList.add("error-message");
    }
  }
}

/**
 * Validate all form fields
 * @returns {boolean} Whether the form is valid
 */
function validateForm() {
  const form = document.getElementById("user-add-form");
  let isValid = true;
  let firstErrorField = null;

  // Clear all previous error messages
  clearAllErrors();

  // Required fields
  const requiredFields = [
    "firstname",
    "lastname",
    "email",
    "password",
    "confirm-password",
    "telephone",
    "street",
    "housenumber",
    "city",
    "zipcode",
  ];

  requiredFields.forEach((field) => {
    const input = document.getElementById(field);
    if (!input) return;

    if (!input.value.trim()) {
      const errorDiv =
        document.getElementById(`${field}-error`) ||
        document.getElementById(`${field.replace("-", "")}-error`);
      if (errorDiv) {
        errorDiv.textContent = "This field is required";
        isValid = false;
        firstErrorField ??= field;

        // Add invalid class to the input field
        input.classList.add("invalid");
      }
    }
  });

  // Email validation
  const emailInput = document.getElementById("email");
  if (emailInput && emailInput.value && !isValidEmail(emailInput.value)) {
    const errorDiv = document.getElementById("email-error");
    if (errorDiv) {
      errorDiv.textContent = "Please enter a valid email address";
      isValid = false;
      firstErrorField ??= "email";

      // Add invalid class to the input field
      emailInput.classList.add("invalid");
    }
  }

  // Password validation
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  // Password requirements
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,25}$/;
  if (password && !passwordRegex.test(password)) {
    const errorDiv = document.getElementById("password-error");
    if (errorDiv) {
      errorDiv.textContent = "Password does not meet requirements";
      isValid = false;
      firstErrorField ??= "password";

      // Add invalid class to the input field
      passwordInput.classList.add("invalid");
    }
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    const errorDiv = document.getElementById("confirm-password-error");
    if (errorDiv) {
      errorDiv.textContent = "Passwords do not match";
      isValid = false;
      firstErrorField ??= "confirm-password";

      // Use warning style for password mismatches (orange instead of red)
      confirmPasswordInput.classList.add("password-warning");
      confirmPasswordInput.classList.remove("invalid");
      errorDiv.classList.add("warning-message");
      errorDiv.classList.remove("error-message");
    }
  }

  // If not valid, scroll to the first error field
  if (!isValid && firstErrorField) {
    scrollToErrorField(firstErrorField);
  }

  return isValid;
}

/**
 * Initialize the cancel button to return to the users list
 */
function initCancelButton() {
  const cancelBtn = document.getElementById("cancel-btn");
  if (!cancelBtn) return;

  cancelBtn.addEventListener("click", () => {
    window.location.href = "/users";
  });
}

/**
 * Initialize the toggle switches for admin and verification status
 */
function initToggleSwitches() {
  const toggleInputs = document.querySelectorAll(".toggle-input");

  toggleInputs.forEach((toggle) => {
    // Update initial status text
    updateToggleStatus(toggle);

    // Add change event listener to update status text when toggled
    toggle.addEventListener("change", () => {
      updateToggleStatus(toggle);
    });
  });
}

/**
 * Update the toggle status text based on the checkbox state
 * @param {HTMLInputElement} toggle The toggle checkbox input element
 */
function updateToggleStatus(toggle) {
  const statusSpan = toggle.parentElement.querySelector(".toggle-status");
  if (!statusSpan) return;

  if (toggle.id === "isAdmin") {
    statusSpan.textContent = toggle.checked ? "Enabled" : "Disabled";
  } else if (toggle.id === "isVerified") {
    statusSpan.textContent = toggle.checked ? "Verified" : "Unverified";
  }
}

/**
 * Get all form data as a structured object
 */
function getFormData() {
  return {
    firstname: document.getElementById("firstname").value,
    lastname: document.getElementById("lastname").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    telephone: document.getElementById("telephone").value,
    street: document.getElementById("street").value,
    housenumber: document.getElementById("housenumber").value,
    city: document.getElementById("city").value,
    zipcode: document.getElementById("zipcode").value,
    isAdmin: document.getElementById("isAdmin").checked,
    isVerified: document.getElementById("isVerified").checked,
  };
}

/**
 * Initialize modal handlers for confirmation dialogs
 */
function initModalHandlers() {
  const modal = document.getElementById("confirmation-modal");
  const closeButton = document.querySelector(".close-modal");
  const cancelButton = document.getElementById("modal-cancel");

  if (!modal) return;

  // Close modal with X or Cancel
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      hideModal();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      hideModal();
    });
  }

  // Close modal if clicked outside
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      hideModal();
    }
  });
}

/**
 * Show the confirmation modal
 * @param {string} title The modal title
 * @param {string} message The modal message
 * @param {Function} confirmAction The function to call when confirmed
 */
function showConfirmationModal(title, message, confirmAction) {
  const modal = document.getElementById("confirmation-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const confirmButton = document.getElementById("modal-confirm");

  if (!modal || !modalTitle || !modalMessage || !confirmButton) return;

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  // Remove any previous event listeners
  const newConfirmButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

  // Add new confirm action
  newConfirmButton.addEventListener("click", () => {
    hideModal();
    confirmAction();
  });

  showModal();
}

/**
 * Show modal
 */
function showModal() {
  const modal = document.getElementById("confirmation-modal");
  if (modal) {
    modal.classList.add("show");
  }
}

/**
 * Hide modal
 */
function hideModal() {
  const modal = document.getElementById("confirmation-modal");
  if (modal) {
    modal.classList.remove("show");
  }
}

/**
 * Show a notification message
 * @param {string} type The notification type (success/error/loading)
 * @param {string} message The message to display
 */
function showNotification(type, message) {
  const notificationArea = document.getElementById("notification-area");
  if (!notificationArea) return;

  notificationArea.innerHTML = message;
  notificationArea.className = `notification ${type} visible`;

  // Scroll to top for all notification types, not just errors
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Don't auto-hide loading notifications
  if (type !== "loading") {
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notificationArea.className = "notification";
      notificationArea.textContent = "";
    }, 5000);
  }
}

/**
 * Validate email format
 * @param {string} email The email to validate
 * @returns {boolean} Whether the email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Reset form to default values
 * @param {HTMLFormElement} form The form to reset
 */
function resetForm(form) {
  if (!form) return;

  // Reset the form
  form.reset();

  // Clear all validation messages
  clearAllErrors();

  // Clear password feedback
  const passwordFeedback = document.getElementById("password-feedback");
  if (passwordFeedback) {
    passwordFeedback.innerHTML = "";
    passwordFeedback.style.display = "none";
  }

  // Focus on the first field
  const firstInput = document.getElementById("firstname");
  if (firstInput) {
    firstInput.focus();
  }
}
