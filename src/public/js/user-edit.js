document.addEventListener("DOMContentLoaded", () => {
  // Initialize form submission handler
  initFormSubmission();

  // Initialize toggle switches
  initToggleSwitches();

  // Initialize cancel button
  initCancelButton();

  // Initialize delete user functionality
  initDeleteUser();

  // Initialize modal functionality
  initModal();
});

/**
 * Initialize the form submission handler
 */
function initFormSubmission() {
  const form = document.getElementById("user-edit-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Set loading state
    setLoadingState(true);

    // Get user ID from the form data attribute
    const userId = form.dataset.userId;

    // Collect form data
    const formData = new FormData(form);
    const userData = {
      firstname: formData.get("firstname"),
      lastname: formData.get("lastname"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      street: formData.get("street"),
      housenumber: formData.get("housenumber"),
      city: formData.get("city"),
      zipcode: formData.get("zipcode"),
      isAdmin: formData.has("isAdmin"),
      isVerified: formData.has("isVerified"),
    };

    try {
      // Send update request
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      // Reset loading state
      setLoadingState(false);

      if (response.ok) {
        // Show success message
        showNotification("success", "User updated successfully");

        // Update toggle status texts to match new state
        updateToggleStatus("isAdmin", userData.isAdmin);
        updateToggleStatus("isVerified", userData.isVerified);
      } else {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => {
            showFieldError(err.field, err.message);
          });
        } else {
          // Show generic error
          showNotification("error", data.message || "Failed to update user");
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showNotification("error", "An error occurred while updating the user");
      setLoadingState(false);
    }
  });
}

/**
 * Initialize the toggle switches for admin and verification status
 */
function initToggleSwitches() {
  const toggles = document.querySelectorAll(".toggle-input");

  toggles.forEach((toggle) => {
    toggle.addEventListener("change", () => {
      updateToggleStatus(toggle.id, toggle.checked);
    });
  });
}

/**
 * Update the status text of a toggle switch
 */
function updateToggleStatus(id, isChecked) {
  const statusEl = document
    .querySelector(`#${id}`)
    .closest(".toggle-switch")
    .querySelector(".toggle-status");
  if (statusEl) {
    if (id === "isAdmin") {
      statusEl.textContent = isChecked ? "Enabled" : "Disabled";
    } else if (id === "isVerified") {
      statusEl.textContent = isChecked ? "Verified" : "Unverified";
    }
  }
}

/**
 * Initialize the cancel button
 */
function initCancelButton() {
  const cancelBtn = document.getElementById("cancel-btn");
  if (!cancelBtn) return;

  cancelBtn.addEventListener("click", () => {
    // Go back to users list
    window.location.href = "/users";
  });
}

/**
 * Initialize the delete user functionality
 */
function initDeleteUser() {
  const deleteBtn = document.getElementById("delete-user-btn");
  if (!deleteBtn) return;

  deleteBtn.addEventListener("click", () => {
    const userId = deleteBtn.dataset.id;

    // Show confirmation modal
    showModal(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
      "Delete",
      () => deleteUser(userId),
    );
  });
}

/**
 * Delete a user
 * @param {string} userId - The ID of the user to delete
 */
async function deleteUser(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Redirect to users list with success message
      window.location.href = "/users?deleted=true";
    } else {
      // Show error
      showNotification("error", data.message || "Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showNotification("error", "An error occurred while deleting the user");
  }
}

/**
 * Initialize the modal functionality
 */
function initModal() {
  const modal = document.getElementById("confirmation-modal");
  const closeBtn = modal.querySelector(".close-modal");
  const cancelBtn = modal.querySelector("#modal-cancel");

  closeBtn.addEventListener("click", () => {
    hideModal();
  });

  cancelBtn.addEventListener("click", () => {
    hideModal();
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });
}

/**
 * Show the confirmation modal
 * @param {string} title - The modal title
 * @param {string} message - The modal message
 * @param {string} confirmText - The text for the confirm button
 * @param {Function} onConfirm - The callback to execute when confirmed
 */
function showModal(title, message, confirmText, onConfirm) {
  const modal = document.getElementById("confirmation-modal");
  const titleEl = modal.querySelector("#modal-title");
  const messageEl = modal.querySelector("#modal-message");
  const confirmBtn = modal.querySelector("#modal-confirm");

  titleEl.textContent = title;
  messageEl.textContent = message;
  confirmBtn.textContent = confirmText;

  // Set confirm button action
  confirmBtn.onclick = () => {
    hideModal();
    onConfirm();
  };

  // Show modal
  modal.classList.add("show");
}

/**
 * Hide the confirmation modal
 */
function hideModal() {
  const modal = document.getElementById("confirmation-modal");
  modal.classList.remove("show");
}

/**
 * Clear all error messages
 */
function clearErrors() {
  // Clear field errors
  document.querySelectorAll(".error-message").forEach((el) => {
    el.textContent = "";
  });

  // Hide notification area
  const notification = document.getElementById("notification-area");
  if (notification) {
    notification.style.display = "none";
    notification.textContent = "";
    notification.className = "notification";
  }
}

/**
 * Show a notification message
 * @param {string} type - The type of notification ('error', 'success')
 * @param {string} message - The message to display
 */
function showNotification(type, message) {
  const notification = document.getElementById("notification-area");
  if (!notification) return;

  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";

  // Scroll to notification
  notification.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * Show a field-specific error message
 * @param {string} field - The field name
 * @param {string} message - The error message
 */
function showFieldError(field, message) {
  const errorEl = document.getElementById(`${field}-error`);
  if (errorEl) {
    errorEl.textContent = message;

    // Add error class to the input
    const input = document.getElementById(field);
    if (input) {
      input.classList.add("error");

      // Focus on the first field with error
      if (!document.querySelector(".error:focus")) {
        input.focus();
      }
    }
  }
}

/**
 * Set loading state during form submission
 * @param {boolean} isLoading - Whether the form is in loading state
 */
function setLoadingState(isLoading) {
  const saveBtn = document.getElementById("save-btn");
  if (!saveBtn) return;

  if (isLoading) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = "Saving...";
  } else {
    saveBtn.disabled = false;
    saveBtn.innerHTML = "Save Changes";
  }
}
