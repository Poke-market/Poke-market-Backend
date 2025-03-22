/**
 * User Edit Page JavaScript
 * Handles form validation, submission, and user deletion
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize UI elements
  const form = document.getElementById("user-edit-form");
  const userId = form.dataset.userId;
  const cancelBtn = document.getElementById("cancel-btn");
  const deleteBtn = document.getElementById("delete-user-btn");
  const notificationArea = document.getElementById("notification-area");
  const saveBtn = document.getElementById("save-btn");
  const adminToggle = document.getElementById("isAdmin");
  const verifiedToggle = document.getElementById("isVerified");
  const modal = document.getElementById("confirmation-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalConfirm = document.getElementById("modal-confirm");
  const modalCancel = document.getElementById("modal-cancel");
  const closeModal = document.querySelector(".close-modal");

  // Password change elements
  const changePasswordBtn = document.getElementById("change-password-btn");
  const passwordChangeForm = document.getElementById("password-change-form");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const passwordFeedback = document.getElementById("password-feedback");
  const updatePasswordBtn = document.getElementById("update-password-btn");
  const cancelPasswordBtn = document.getElementById("cancel-password-btn");

  // Track form modified state
  let formModified = false;
  let passwordFormModified = false;

  // Form field elements
  const formFields = [
    "firstname",
    "lastname",
    "email",
    "telephone",
    "street",
    "housenumber",
    "city",
    "zipcode",
  ];

  // Initialize event listeners
  initFormListeners();
  initToggleSwitches();
  initModalListeners();
  initPasswordChangeListeners();

  /**
   * Initialize form event listeners
   */
  function initFormListeners() {
    // Add input listeners to form fields
    formFields.forEach((field) => {
      const input = document.getElementById(field);
      if (input) {
        input.addEventListener("input", () => {
          formModified = true;
          clearFieldError(field);
        });
      }
    });

    // Form submission handler
    form.addEventListener("submit", handleFormSubmit);

    // Cancel button handler
    cancelBtn.addEventListener("click", handleCancel);

    // Delete button handler
    if (deleteBtn) {
      deleteBtn.addEventListener("click", confirmDelete);
    }
  }

  /**
   * Initialize password change form listeners
   */
  function initPasswordChangeListeners() {
    if (changePasswordBtn) {
      // Show/hide password change form
      changePasswordBtn.addEventListener("click", function () {
        passwordChangeForm.style.display = "block";
        changePasswordBtn.style.display = "none";
        newPasswordInput.focus();
      });

      // Cancel password change
      if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener("click", function () {
          hidePasswordForm();
        });
      }

      // Password input validation
      if (newPasswordInput) {
        newPasswordInput.addEventListener("input", function () {
          passwordFormModified = true;
          validatePassword();
          clearFieldError("new-password");

          // Check confirm password match if it has a value
          if (confirmPasswordInput && confirmPasswordInput.value) {
            checkPasswordsMatch();
          }
        });
      }

      // Confirm password validation
      if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener("input", function () {
          passwordFormModified = true;
          checkPasswordsMatch();
        });
      }

      // Update password button
      if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener("click", confirmPasswordUpdate);
      }
    }
  }

  /**
   * Initialize toggle switches
   */
  function initToggleSwitches() {
    // Admin toggle
    if (adminToggle) {
      adminToggle.addEventListener("change", function () {
        formModified = true;
        updateToggleStatus(this, "isAdmin");
      });
    }

    // Verified toggle
    if (verifiedToggle) {
      verifiedToggle.addEventListener("change", function () {
        formModified = true;
        updateToggleStatus(this, "isVerified");
      });
    }
  }

  /**
   * Initialize modal listeners
   */
  function initModalListeners() {
    // Close modal buttons
    [modalCancel, closeModal].forEach((el) => {
      if (el) {
        el.addEventListener("click", hideModal);
      }
    });

    // Modal confirm button uses dynamic handler set in confirmDelete or confirmDiscard
  }

  /**
   * Update toggle switch status text
   */
  function updateToggleStatus(toggleElement, toggleType) {
    const statusElement =
      toggleElement.parentElement.querySelector(".toggle-status");
    if (statusElement) {
      if (toggleType === "isAdmin") {
        statusElement.textContent = toggleElement.checked
          ? "Enabled"
          : "Disabled";
      } else if (toggleType === "isVerified") {
        statusElement.textContent = toggleElement.checked
          ? "Verified"
          : "Unverified";
      }
    }
  }

  /**
   * Handle form submission
   */
  async function handleFormSubmit(e) {
    e.preventDefault();

    // Clear existing errors
    clearAllErrors();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare form data
    const userData = {
      firstname: document.getElementById("firstname").value,
      lastname: document.getElementById("lastname").value,
      email: document.getElementById("email").value,
      telephone: document.getElementById("telephone").value,
      street: document.getElementById("street").value,
      housenumber: document.getElementById("housenumber").value,
      city: document.getElementById("city").value,
      zipcode: document.getElementById("zipcode").value,
      isAdmin: document.getElementById("isAdmin").checked,
      isVerified: document.getElementById("isVerified").checked,
    };

    try {
      // Set button to loading state
      setLoadingState(true);
      showNotification("Saving changes...", "loading");

      // Submit form data
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      // Reset button state
      setLoadingState(false);

      if (!response.ok) {
        // Handle validation or other errors
        handleSubmitErrors(data);
        return;
      }

      // Success
      showNotification("User details updated successfully.", "success");
      formModified = false;
    } catch (error) {
      console.error("Error updating user:", error);
      setLoadingState(false);
      showNotification("Error updating user: " + error.message, "error");
    }
  }

  /**
   * Handle cancel button click
   */
  function handleCancel() {
    if (formModified) {
      confirmDiscard();
    } else {
      // No changes, return to user list
      window.location.href = "/users";
    }
  }

  /**
   * Confirm discarding changes
   */
  function confirmDiscard() {
    modalTitle.textContent = "Discard Changes";
    modalMessage.textContent = "Are you sure you want to discard your changes?";

    // Set confirm button handler
    modalConfirm.onclick = function () {
      hideModal();
      window.location.href = "/users";
    };

    showModal();
  }

  /**
   * Confirm user deletion
   */
  function confirmDelete() {
    const userName = `${document.getElementById("firstname").value} ${document.getElementById("lastname").value}`;

    modalTitle.textContent = "Delete User";
    modalMessage.textContent = `Are you sure you want to delete ${userName}? This action cannot be undone.`;

    // Set confirm button handler
    modalConfirm.onclick = function () {
      hideModal();
      deleteUser();
    };

    showModal();
  }

  /**
   * Delete user
   */
  async function deleteUser() {
    try {
      // Show loading notification
      showNotification("Deleting user...", "loading");

      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error deleting user");
      }

      // Success - redirect to users list with success message
      sessionStorage.setItem("userMessage", "User deleted successfully");
      window.location.href = "/users";
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Error deleting user: " + error.message, "error");
    }
  }

  /**
   * Handle submit errors
   */
  function handleSubmitErrors(data) {
    let firstErrorField = null;

    if (data.data && data.data.errors) {
      // Field-specific errors
      if (Array.isArray(data.data.errors)) {
        data.data.errors.forEach((err) => {
          if (Array.isArray(err)) {
            // Format: [field, message]
            const [field, message] = err;
            showFieldError(field, message);
            firstErrorField ??= field;
          }
        });
      }

      // Show general error message
      showNotification("Please correct the errors in the form.", "error");

      // Scroll to first error field if there is one
      if (firstErrorField) {
        scrollToErrorField(firstErrorField);
      }
    } else {
      // General error
      showNotification(data.message || "Error updating user.", "error");
    }
  }

  /**
   * Validate the form
   */
  function validateForm() {
    let isValid = true;
    let firstErrorField = null;

    // Required fields
    formFields.forEach((field) => {
      const input = document.getElementById(field);
      if (input && !input.value.trim()) {
        showFieldError(field, "This field is required");
        isValid = false;
        firstErrorField ??= field;
      }
    });

    // Email validation
    const emailInput = document.getElementById("email");
    if (emailInput && emailInput.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value)) {
        showFieldError("email", "Please enter a valid email address");
        isValid = false;
        firstErrorField ??= "email";
      }
    }

    // Phone validation
    const phoneInput = document.getElementById("telephone");
    if (phoneInput && phoneInput.value.trim()) {
      const phoneRegex = /^[0-9+\- ]{10,15}$/;
      if (!phoneRegex.test(phoneInput.value)) {
        showFieldError("telephone", "Please enter a valid phone number");
        isValid = false;
        firstErrorField ??= "telephone";
      }
    }

    // If not valid, scroll to the first error field
    if (!isValid && firstErrorField) {
      scrollToErrorField(firstErrorField);
    }

    return isValid;
  }

  /**
   * Set button loading state
   */
  function setLoadingState(loading) {
    if (loading) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    } else {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
    }
  }

  /**
   * Show a field error
   */
  function showFieldError(field, message) {
    const errorElement = document.getElementById(`${field}-error`);
    const inputField = document.getElementById(field);

    if (errorElement) {
      errorElement.textContent = message;
    }

    // Add invalid class to the input field
    if (inputField) {
      inputField.classList.add("invalid");
    }
  }

  /**
   * Clear a field error
   */
  function clearFieldError(field) {
    const errorElement = document.getElementById(`${field}-error`);
    const inputField = document.getElementById(field);

    if (errorElement) {
      errorElement.textContent = "";
    }

    // Remove invalid class from the input field
    if (inputField) {
      inputField.classList.remove("invalid");
    }
  }

  /**
   * Clear all field errors
   */
  function clearAllErrors() {
    // Clear all error messages
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
    });

    // Remove invalid class from all inputs
    document.querySelectorAll(".form-input").forEach((input) => {
      input.classList.remove("invalid");
      input.classList.remove("password-warning");
    });
  }

  /**
   * Show notification
   */
  function showNotification(message, type = "error") {
    notificationArea.innerHTML = message;
    notificationArea.className = `notification ${type} visible`;

    // Scroll to top for all notification types, not just errors
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Clear notification
   */
  function clearNotification() {
    notificationArea.className = "notification";
    notificationArea.textContent = "";
  }

  /**
   * Show modal
   */
  function showModal() {
    modal.classList.add("show");
  }

  /**
   * Hide modal
   */
  function hideModal() {
    modal.classList.remove("show");
  }

  /**
   * Check for stored user messages
   */
  function checkStoredMessages() {
    const userMessage = sessionStorage.getItem("userMessage");
    if (userMessage) {
      showNotification(userMessage, "success");
      sessionStorage.removeItem("userMessage");
    }
  }

  // Check for stored messages on page load
  checkStoredMessages();

  /**
   * Hide the password change form and reset fields
   */
  function hidePasswordForm() {
    passwordChangeForm.style.display = "none";
    changePasswordBtn.style.display = "block";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    passwordFeedback.innerHTML = "";
    clearFieldError("new-password");
    clearFieldError("confirm-password");
    passwordFormModified = false;
  }

  /**
   * Validate password requirements
   */
  function validatePassword() {
    const password = newPasswordInput.value;
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

    // Add or remove orange warning border
    if (!isValid) {
      newPasswordInput.classList.add("password-warning");
      newPasswordInput.classList.remove("invalid"); // Remove red border if present
    } else {
      newPasswordInput.classList.remove("password-warning");
    }

    return isValid;
  }

  /**
   * Check if passwords match
   */
  function checkPasswordsMatch() {
    if (newPasswordInput.value !== confirmPasswordInput.value) {
      const errorElement = document.getElementById("confirm-password-error");
      if (errorElement) {
        errorElement.textContent = "Passwords don't match";

        // Apply orange color to the message
        errorElement.classList.add("warning-message");
        errorElement.classList.remove("error-message");
      }

      // Use orange warning instead of red error
      confirmPasswordInput.classList.add("password-warning");
      confirmPasswordInput.classList.remove("invalid");
      return false;
    } else {
      const errorElement = document.getElementById("confirm-password-error");
      if (errorElement) {
        errorElement.textContent = "";

        // Reset message classes
        errorElement.classList.remove("warning-message");
        errorElement.classList.add("error-message");
      }

      confirmPasswordInput.classList.remove("password-warning");
      return true;
    }
  }

  /**
   * Confirm password update with modal
   */
  function confirmPasswordUpdate() {
    // Validate password first
    clearFieldError("new-password");
    clearFieldError("confirm-password");

    const isPasswordValid = validatePassword();
    const doPasswordsMatch = checkPasswordsMatch();

    if (!isPasswordValid || !doPasswordsMatch) {
      return;
    }

    // Show confirmation modal
    modalTitle.textContent = "Update Password";
    modalMessage.textContent =
      "Are you sure you want to update this user's password?";

    // Set confirm button handler
    modalConfirm.onclick = function () {
      hideModal();
      handlePasswordUpdate();
    };

    showModal();
  }

  /**
   * Handle password update
   */
  async function handlePasswordUpdate() {
    try {
      // Show loading state
      updatePasswordBtn.disabled = true;
      updatePasswordBtn.textContent = "Updating...";
      showNotification("Updating password...", "loading");

      // Send password update request
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPasswordInput.value,
        }),
      });

      // Reset button state
      updatePasswordBtn.disabled = false;
      updatePasswordBtn.textContent = "Update Password";

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      }

      // Success
      showNotification("Password updated successfully", "success");
      hidePasswordForm();
    } catch (error) {
      console.error("Error updating password:", error);
      showNotification("Error: " + error.message, "error");
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
});
