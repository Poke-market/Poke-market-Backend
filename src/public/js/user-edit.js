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

  // Track form modified state
  let formModified = false;

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
      emailVerified: document.getElementById("isVerified").checked,
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
   * Validate the form
   */
  function validateForm() {
    let isValid = true;

    // Required fields
    formFields.forEach((field) => {
      const input = document.getElementById(field);
      if (input && !input.value.trim()) {
        showFieldError(field, "This field is required");
        isValid = false;
      }
    });

    // Email validation
    const emailInput = document.getElementById("email");
    if (emailInput && emailInput.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value)) {
        showFieldError("email", "Please enter a valid email address");
        isValid = false;
      }
    }

    // Phone validation
    const phoneInput = document.getElementById("telephone");
    if (phoneInput && phoneInput.value.trim()) {
      const phoneRegex = /^[0-9+\- ]{10,15}$/;
      if (!phoneRegex.test(phoneInput.value)) {
        showFieldError("telephone", "Please enter a valid phone number");
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Handle submit errors
   */
  function handleSubmitErrors(data) {
    if (data.data && data.data.errors) {
      // Field-specific errors
      if (Array.isArray(data.data.errors)) {
        data.data.errors.forEach((err) => {
          if (Array.isArray(err)) {
            // Format: [field, message]
            const [field, message] = err;
            showFieldError(field, message);
          }
        });
      }

      // Show general error message
      showNotification("Please correct the errors in the form.", "error");
    } else {
      // General error
      showNotification(data.message || "Error updating user.", "error");
    }
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
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  /**
   * Clear a field error
   */
  function clearFieldError(field) {
    const errorElement = document.getElementById(`${field}-error`);
    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  /**
   * Clear all field errors
   */
  function clearAllErrors() {
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
    });
  }

  /**
   * Show notification
   */
  function showNotification(message, type = "error") {
    notificationArea.innerHTML = message;
    notificationArea.className = `notification ${type} visible`;

    if (type === "error") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
});
