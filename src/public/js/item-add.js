document.addEventListener("DOMContentLoaded", () => {
  initFormSubmission();
  initValidation();
  initCancelButton();
  initModalHandlers();
  initToggleSwitches();
  initInputListeners();
  initImagePreview();
  initTagsInput();
});

/**
 * Initialize form submission handling
 */
function initFormSubmission() {
  const form = document.getElementById("item-add-form");
  const saveBtn = document.getElementById("save-btn");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Ask for confirmation before creating the item
    showConfirmationModal(
      "Create New Item?",
      "Are you sure you want to create this item?",
      async () => {
        try {
          const formData = getFormData();

          // Show loading notification and set button state
          showNotification("loading", "Creating item...");
          setLoadingState(true);

          const response = await fetch("/api/items", {
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
          showNotification("success", "Item created successfully!");

          // Reset form to add another item
          resetForm(form);
        } catch (error) {
          console.error("Error creating item:", error);
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
      saveBtn.textContent = "Create Item";
    }
  }
}

/**
 * Initialize input validation
 */
function initValidation() {
  // Price input formatting
  const priceInput = document.getElementById("price");
  if (priceInput) {
    priceInput.addEventListener("input", function (e) {
      // Remove non-numeric characters except decimal point
      let value = this.value.replace(/[^\d.]/g, "");

      // Ensure only one decimal point
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }

      // Limit to 2 decimal places
      if (parts.length > 1 && parts[1].length > 2) {
        value = parts[0] + "." + parts[1].substring(0, 2);
      }

      this.value = value;
    });
  }

  // Discount amount input formatting
  const discountAmountInput = document.getElementById("discount-amount");
  if (discountAmountInput) {
    discountAmountInput.addEventListener("input", function (e) {
      // Remove non-numeric characters except decimal point
      let value = this.value.replace(/[^\d.]/g, "");

      // Ensure only one decimal point
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }

      // Limit to 2 decimal places
      if (parts.length > 1 && parts[1].length > 2) {
        value = parts[0] + "." + parts[1].substring(0, 2);
      }

      this.value = value;
      updateDiscountPreview();
    });
  }

  // Discount type change
  const discountTypeSelect = document.getElementById("discount-type");
  if (discountTypeSelect) {
    discountTypeSelect.addEventListener("change", updateDiscountPreview);
  }
}

/**
 * Update discount preview
 */
function updateDiscountPreview() {
  const price = parseFloat(document.getElementById("price").value) || 0;
  const discountAmount =
    parseFloat(document.getElementById("discount-amount").value) || 0;
  const discountType = document.getElementById("discount-type").value;
  const previewElement = document.getElementById("discount-preview");

  if (!previewElement || !price) return;

  let discountedPrice = price;
  let formattedDiscount = "";

  if (discountAmount > 0) {
    if (discountType === "percentage") {
      discountedPrice = price * (1 - discountAmount / 100);
      formattedDiscount = `${discountAmount}%`;
    } else {
      discountedPrice = price - discountAmount;
      formattedDiscount = `$${discountAmount.toFixed(2)}`;
    }

    // Don't allow negative prices
    discountedPrice = Math.max(0, discountedPrice);

    previewElement.innerHTML = `
      <p>Original price: $${price.toFixed(2)}</p>
      <p>Discount: ${formattedDiscount}</p>
      <p>Final price: $${discountedPrice.toFixed(2)}</p>
    `;
    previewElement.style.display = "block";
  } else {
    previewElement.style.display = "none";
  }
}

/**
 * Initialize image preview functionality
 */
function initImagePreview() {
  const photoUrlInput = document.getElementById("photoUrl");
  const previewContainer = document.getElementById("image-preview");

  if (!photoUrlInput || !previewContainer) return;

  photoUrlInput.addEventListener("input", function () {
    const url = this.value.trim();

    if (url) {
      // Create image element
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Item image preview";
      img.style.maxWidth = "100%";
      img.style.maxHeight = "200px";

      // Clear previous preview
      previewContainer.innerHTML = "";
      previewContainer.appendChild(img);

      // Show loading state
      img.style.opacity = "0.3";

      // Handle image load success
      img.onload = function () {
        img.style.opacity = "1";
        clearFieldError("photoUrl");
      };

      // Handle image load error
      img.onerror = function () {
        previewContainer.innerHTML =
          "<div class='image-error'>Invalid image URL</div>";
        showFieldError("photoUrl", "Please enter a valid image URL");
      };
    } else {
      previewContainer.innerHTML = "";
    }
  });
}

/**
 * Initialize tags input functionality
 */
function initTagsInput() {
  const tagsInput = document.getElementById("tags");
  const tagsContainer = document.getElementById("tags-container");

  if (!tagsInput || !tagsContainer) return;

  tagsInput.addEventListener("keydown", function (e) {
    // If Enter or comma is pressed
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(this.value.trim());
      this.value = "";
    }
  });

  // Add button for adding tags
  const addTagBtn = document.getElementById("add-tag-btn");
  if (addTagBtn) {
    addTagBtn.addEventListener("click", function () {
      const value = tagsInput.value.trim();
      if (value) {
        addTag(value);
        tagsInput.value = "";
        tagsInput.focus();
      }
    });
  }

  /**
   * Add a tag to the container
   * @param {string} text The tag text
   */
  function addTag(text) {
    if (!text) return;

    // Clean up text (remove commas)
    text = text.replace(/,/g, "").trim();
    if (!text) return;

    // Check if tag already exists
    const existingTags = getSelectedTags();
    if (existingTags.includes(text)) return;

    // Create tag element
    const tag = document.createElement("div");
    tag.className = "tag-item";
    tag.innerHTML = `
      <span>${text}</span>
      <button type="button" class="remove-tag-btn">&times;</button>
      <input type="hidden" name="item-tags[]" value="${text}">
    `;

    // Add remove button handler
    tag.querySelector(".remove-tag-btn").addEventListener("click", function () {
      tag.remove();
      updateTagsValidation();
    });

    // Add to container
    tagsContainer.appendChild(tag);

    // Update validation state
    updateTagsValidation();
  }

  /**
   * Get all currently selected tags
   * @returns {string[]} Array of tag names
   */
  function getSelectedTags() {
    const tagInputs = tagsContainer.querySelectorAll(
      "input[name='item-tags[]']",
    );
    return Array.from(tagInputs).map((input) => input.value);
  }

  /**
   * Check if tags validation is needed
   */
  function updateTagsValidation() {
    const selectedTags = getSelectedTags();
    if (selectedTags.length === 0) {
      showFieldError("tags", "Please add at least one tag");
    } else {
      clearFieldError("tags");
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
    showNotification("error", data.message || "Failed to create item.");
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

    // Calculate position with offset
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
 * Initialize input listeners to clear error messages when typing
 */
function initInputListeners() {
  // Required fields
  const fields = [
    "name",
    "description",
    "category",
    "photoUrl",
    "price",
    "tags",
    "discount-amount",
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
 * Clear a field error message
 * @param {string} field The field name
 */
function clearFieldError(field) {
  const errorDiv = document.getElementById(`${field}-error`);
  const inputField = document.getElementById(field);

  if (errorDiv) {
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
  });
}

/**
 * Initialize the cancel button to return to the items list
 */
function initCancelButton() {
  const cancelBtn = document.getElementById("cancel-btn");
  if (!cancelBtn) return;

  cancelBtn.addEventListener("click", () => {
    window.location.href = "/items";
  });
}

/**
 * Initialize the toggle switches for new item status
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

  if (toggle.id === "isNewItem") {
    statusSpan.textContent = toggle.checked ? "Enabled" : "Disabled";
  }
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
 * Validate all form fields
 * @returns {boolean} Whether the form is valid
 */
function validateForm() {
  let isValid = true;
  let firstErrorField = null;

  // Clear all previous error messages
  clearAllErrors();

  // Required fields
  const requiredFields = [
    "name",
    "description",
    "category",
    "photoUrl",
    "price",
  ];

  requiredFields.forEach((field) => {
    const input = document.getElementById(field);
    if (!input) return;

    if (!input.value.trim()) {
      showFieldError(field, "This field is required");
      isValid = false;
      firstErrorField ??= field;
    }
  });

  // Price validation
  const priceInput = document.getElementById("price");
  if (priceInput && priceInput.value.trim()) {
    const price = parseFloat(priceInput.value);
    if (isNaN(price) || price <= 0) {
      showFieldError("price", "Please enter a valid price greater than zero");
      isValid = false;
      firstErrorField ??= "price";
    }
  }

  // Discount amount validation
  const discountAmountInput = document.getElementById("discount-amount");
  const discountTypeSelect = document.getElementById("discount-type");
  if (discountAmountInput && discountAmountInput.value.trim()) {
    const amount = parseFloat(discountAmountInput.value);
    const type = discountTypeSelect.value;
    const price = parseFloat(priceInput.value) || 0;

    if (isNaN(amount) || amount < 0) {
      showFieldError("discount-amount", "Please enter a valid discount amount");
      isValid = false;
      firstErrorField ??= "discount-amount";
    } else if (type === "percentage" && amount > 100) {
      showFieldError(
        "discount-amount",
        "Percentage discount cannot exceed 100%",
      );
      isValid = false;
      firstErrorField ??= "discount-amount";
    } else if (type === "absolute" && amount > price) {
      showFieldError(
        "discount-amount",
        "Absolute discount cannot exceed the price",
      );
      isValid = false;
      firstErrorField ??= "discount-amount";
    }
  }

  // Tags validation
  const tagsContainer = document.getElementById("tags-container");
  if (tagsContainer) {
    const tagInputs = tagsContainer.querySelectorAll(
      "input[name='item-tags[]']",
    );
    if (tagInputs.length === 0) {
      showFieldError("tags", "Please add at least one tag");
      isValid = false;
      firstErrorField ??= "tags";
    }
  }

  // If not valid, scroll to the first error field
  if (!isValid && firstErrorField) {
    scrollToErrorField(firstErrorField);
  }

  return isValid;
}

/**
 * Get all form data as a structured object
 */
function getFormData() {
  // Get selected tags
  const tagsContainer = document.getElementById("tags-container");
  const tagInputs = tagsContainer.querySelectorAll("input[name='item-tags[]']");
  const tags = Array.from(tagInputs).map((input) => input.value);

  // Get discount data
  const discountAmount =
    parseFloat(document.getElementById("discount-amount").value) || 0;
  const discountType = document.getElementById("discount-type").value;

  // Build the form data object
  return {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    category: document.getElementById("category").value,
    photoUrl: document.getElementById("photoUrl").value,
    price: parseFloat(document.getElementById("price").value),
    tags: tags,
    isNewItem: document.getElementById("isNewItem").checked,
    discount: {
      amount: discountAmount,
      type: discountType,
    },
  };
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

  // Clear tag container
  const tagsContainer = document.getElementById("tags-container");
  if (tagsContainer) {
    tagsContainer.innerHTML = "";
  }

  // Clear image preview
  const imagePreview = document.getElementById("image-preview");
  if (imagePreview) {
    imagePreview.innerHTML = "";
  }

  // Clear discount preview
  const discountPreview = document.getElementById("discount-preview");
  if (discountPreview) {
    discountPreview.style.display = "none";
  }

  // Focus on the first field
  const firstInput = document.getElementById("name");
  if (firstInput) {
    firstInput.focus();
  }
}
