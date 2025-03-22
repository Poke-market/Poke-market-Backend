document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // Utility functions
  function debounce(func, delay) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  // Initialize UI elements
  const form = document.getElementById("item-add-form");
  const cancelBtn = document.getElementById("cancel-btn");
  const notificationArea = document.getElementById("notification-area");
  const saveBtn = document.getElementById("save-btn");
  const isNewToggle = document.getElementById("isNewItem");
  const modal = document.getElementById("confirmation-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalConfirm = document.getElementById("modal-confirm");
  const modalCancel = document.getElementById("modal-cancel");
  const closeModal = document.querySelector(".close-modal");
  const tagsContainer = document.getElementById("tags-container");

  // Track form modified state
  let formModified = false;

  // Store selected tags
  let selectedTags = [];

  // Initialize all components
  initFormListeners();
  initToggleSwitches();
  initModalListeners();
  initValidation();
  initImagePreview();
  initTagSelection();

  // Check for stored messages on page load
  checkStoredMessages();

  /**
   * Initialize form listeners for events
   */
  function initFormListeners() {
    // Price field
    const priceInput = document.getElementById("price");
    if (priceInput) {
      priceInput.addEventListener(
        "input",
        debounce(updateDiscountPreview, 300),
      );
    }

    // Discount amount field
    const discountAmountInput = document.getElementById("discount-amount");
    if (discountAmountInput) {
      discountAmountInput.addEventListener(
        "input",
        debounce(updateDiscountPreview, 300),
      );
    }

    // Discount type radio buttons
    document
      .querySelectorAll('input[name="discount-type"]')
      .forEach((radio) => {
        radio.addEventListener("change", updateDiscountPreview);
      });

    // Handle form submission
    form.addEventListener("submit", handleFormSubmit);

    // Cancel button
    document
      .getElementById("cancel-btn")
      .addEventListener("click", handleCancel);

    // Calculate discount preview immediately
    updateDiscountPreview();
  }

  /**
   * Initialize validation for specific fields
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
      });
    }

    // Form fields error clearing
    const fields = [
      "name",
      "description",
      "category",
      "photoUrl",
      "price",
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
   * Handle form submission
   * @param {Event} e The submit event
   */
  async function handleFormSubmit(e) {
    e.preventDefault();
    formModified = false;

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

          // Show loading notification
          showNotification("loading", "Creating item...");

          // Set button loading state
          setSaveButtonLoading(true);

          const response = await fetch("/api/items", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          const result = await response.json();

          // Reset loading state
          setSaveButtonLoading(false);

          if (!response.ok) {
            // Handle server-side validation errors
            handleSubmitErrors(result);
            return;
          }

          // Show success notification
          showNotification("success", "Item created successfully!");

          // Reset the form for adding another item
          resetForm();
        } catch (error) {
          console.error("Error creating item:", error);
          setSaveButtonLoading(false);
          showNotification(
            "error",
            "An unexpected error occurred. Please try again.",
          );
        }
      },
    );
  }

  /**
   * Set the save button loading state
   * @param {boolean} isLoading Whether the button should show loading state
   */
  function setSaveButtonLoading(isLoading) {
    if (saveBtn) {
      saveBtn.disabled = isLoading;
      saveBtn.textContent = isLoading ? "Creating..." : "Create Item";
    }
  }

  /**
   * Handle cancel button click
   */
  function handleCancel() {
    if (formModified) {
      showConfirmationModal(
        "Discard Changes?",
        "Are you sure you want to discard your changes?",
        () => {
          window.location.href = "/items";
        },
      );
    } else {
      window.location.href = "/items";
    }
  }

  /**
   * Update discount preview based on price and discount values
   */
  function updateDiscountPreview() {
    const price = parseFloat(document.getElementById("price").value) || 0;
    const discountAmount =
      parseFloat(document.getElementById("discount-amount").value) || 0;
    const discountType =
      document.querySelector('input[name="discount-type"]:checked')?.value ||
      "percentage";
    const previewElement = document.getElementById("discount-preview");

    if (!previewElement) return;

    let discountedPrice = price;
    let formattedDiscount = "";

    if (discountAmount > 0 && price > 0) {
      if (discountType === "percentage") {
        discountedPrice = price * (1 - discountAmount / 100);
        formattedDiscount = `${discountAmount}%`;
      } else {
        discountedPrice = price - discountAmount;
        formattedDiscount = `¥${discountAmount.toFixed(2)}`;
      }

      // Don't allow negative prices
      discountedPrice = Math.max(0, discountedPrice);

      previewElement.innerHTML = `
        <p><span>Original price:</span> <span>¥${price.toFixed(2)}</span></p>
        <p><span>Discount:</span> <span>${formattedDiscount}</span></p>
        <p><span>Final price:</span> <span>¥${discountedPrice.toFixed(2)}</span></p>
      `;
      previewElement.classList.add("visible");
    } else {
      previewElement.classList.remove("visible");
    }
  }

  /**
   * Initialize toggle switches
   */
  function initToggleSwitches() {
    if (isNewToggle) {
      isNewToggle.addEventListener("change", function () {
        formModified = true;
        updateToggleStatus(this);
      });

      // Initialize toggle status text
      updateToggleStatus(isNewToggle);
    }
  }

  /**
   * Update toggle status text
   * @param {HTMLElement} toggle The toggle input element
   */
  function updateToggleStatus(toggle) {
    const statusSpan = toggle.parentElement.querySelector(".toggle-status");
    if (statusSpan) {
      statusSpan.textContent = toggle.checked ? "Enabled" : "Disabled";
    }
  }

  /**
   * Initialize modal event listeners
   */
  function initModalListeners() {
    if (!modal) return;

    // Close modal with X button
    if (closeModal) {
      closeModal.addEventListener("click", hideModal);
    }

    // Close modal with Cancel button
    if (modalCancel) {
      modalCancel.addEventListener("click", hideModal);
    }

    // Close modal when clicking outside content
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideModal();
      }
    });
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
        img.className = "preview-image";

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
            "<div class='image-error'>Could not load image. Please check the URL.</div>";
          showFieldError("photoUrl", "Please enter a valid image URL");
        };
      } else {
        previewContainer.innerHTML =
          "<div class='image-placeholder'>Image preview will appear here</div>";
      }
    });
  }

  /**
   * Initialize tag selection with clickable tags
   */
  function initTagSelection() {
    const availableTags = document.getElementById("available-tags");
    if (!availableTags) return;

    // Initialize click handlers for all tags
    const tagElements = availableTags.querySelectorAll(".available-tag");
    tagElements.forEach((tag) => {
      tag.addEventListener("click", function () {
        const tagName = this.getAttribute("data-tag");
        if (!tagName) return;

        // Toggle selection state
        this.classList.toggle("selected");

        // Update selected tags array
        if (this.classList.contains("selected")) {
          if (!selectedTags.includes(tagName)) {
            selectedTags.push(tagName);
          }
        } else {
          const index = selectedTags.indexOf(tagName);
          if (index > -1) {
            selectedTags.splice(index, 1);
          }
        }

        // Mark form as modified
        formModified = true;

        // Validate tags
        validateTags();
      });
    });
  }

  /**
   * Validate tags selection
   */
  function validateTags() {
    if (selectedTags.length === 0) {
      showFieldError("tags", "Please select at least one tag");
    } else {
      clearFieldError("tags");
    }
  }

  /**
   * Check for stored messages in localStorage
   */
  function checkStoredMessages() {
    const message = localStorage.getItem("itemMessage");
    const type = localStorage.getItem("itemMessageType");

    if (message && type) {
      showNotification(type, message);

      // Clear the stored message
      localStorage.removeItem("itemMessage");
      localStorage.removeItem("itemMessageType");
    }
  }

  /**
   * Show notification message
   * @param {string} type The notification type: 'success', 'error', 'loading'
   * @param {string} message The message text
   */
  function showNotification(type, message) {
    if (!notificationArea) return;

    notificationArea.textContent = message;
    notificationArea.className = `notification ${type} visible`;

    // Scroll to top to make notification visible
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Auto-hide after delay (except for loading)
    if (type !== "loading") {
      setTimeout(() => {
        notificationArea.className = "notification";
      }, 5000);
    }
  }

  /**
   * Show confirmation modal
   * @param {string} title The modal title
   * @param {string} message The modal message
   * @param {Function} onConfirm Callback function when confirmed
   */
  function showConfirmationModal(title, message, onConfirm) {
    if (!modal || !modalTitle || !modalMessage || !modalConfirm) return;

    // Set modal content
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Remove any existing event listeners
    const newConfirmBtn = modalConfirm.cloneNode(true);
    modalConfirm.parentNode.replaceChild(newConfirmBtn, modalConfirm);

    // Add new confirm action
    newConfirmBtn.addEventListener("click", () => {
      hideModal();
      if (typeof onConfirm === "function") {
        onConfirm();
      }
    });

    // Show the modal
    modal.classList.add("show");
  }

  /**
   * Hide confirmation modal
   */
  function hideModal() {
    if (modal) {
      modal.classList.remove("show");
    }
  }

  /**
   * Reset form to default values
   */
  function resetForm() {
    // Reset form elements
    form.reset();

    // Clear tag selections
    const tagElements = document.querySelectorAll(".available-tag");
    tagElements.forEach((tag) => {
      tag.classList.remove("selected");
    });
    selectedTags = [];

    // Clear image preview
    const imagePreview = document.getElementById("image-preview");
    if (imagePreview) {
      imagePreview.innerHTML =
        "<div class='image-placeholder'>Image preview will appear here</div>";
    }

    // Clear discount preview
    const discountPreview = document.getElementById("discount-preview");
    if (discountPreview) {
      discountPreview.innerHTML = "";
      discountPreview.classList.remove("visible");
    }

    // Reset validation state
    clearAllErrors();

    // Reset toggle states
    if (isNewToggle) {
      isNewToggle.checked = false;
      updateToggleStatus(isNewToggle);
    }

    // Reset form modified flag
    formModified = false;

    // Focus first field
    const nameInput = document.getElementById("name");
    if (nameInput) {
      nameInput.focus();
    }
  }

  /**
   * Validate all form fields
   * @returns {boolean} Whether the form is valid
   */
  function validateForm() {
    let isValid = true;
    let firstErrorField = null;

    // Clear all previous errors
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
    if (discountAmountInput && discountAmountInput.value.trim()) {
      const amount = parseFloat(discountAmountInput.value);
      const type =
        document.querySelector('input[name="discount-type"]:checked')?.value ||
        "percentage";
      const price = parseFloat(priceInput.value) || 0;

      if (isNaN(amount) || amount < 0) {
        showFieldError(
          "discount-amount",
          "Please enter a valid discount amount",
        );
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
    if (selectedTags.length === 0) {
      showFieldError("tags", "Please select at least one tag");
      isValid = false;
      firstErrorField ??= "tags";
    }

    // If not valid, scroll to first error field
    if (!isValid && firstErrorField) {
      scrollToErrorField(firstErrorField);
    }

    return isValid;
  }

  /**
   * Scroll to a field with error
   * @param {string} fieldName Field to scroll to
   */
  function scrollToErrorField(fieldName) {
    if (!fieldName) return;

    const field = document.getElementById(fieldName);
    if (!field) return;

    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      // Get the field's position
      const rect = field.getBoundingClientRect();

      // Calculate position with offset
      const headerOffset = 200;
      const offsetPosition = window.pageYOffset + rect.top - headerOffset;

      // Scroll to the element
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Focus the field after scrolling
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
   * Handle validation errors from API response
   * @param {Object} data Error data from API
   */
  function handleSubmitErrors(data) {
    // Clear existing errors
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

      // Scroll to first error field
      if (firstErrorField) {
        scrollToErrorField(firstErrorField);
      }
    } else {
      // General error
      showNotification("error", data.message || "Failed to create item.");
    }
  }

  /**
   * Get all form data as a structured object
   * @returns {Object} The form data
   */
  function getFormData() {
    // Build the form data object
    return {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      category: document.getElementById("category").value,
      photoUrl: document.getElementById("photoUrl").value,
      price: parseFloat(document.getElementById("price").value) || 0,
      tags: selectedTags,
      isNewItem: document.getElementById("isNewItem").checked,
      discount: {
        amount:
          parseFloat(document.getElementById("discount-amount").value) || 0,
        type:
          document.querySelector('input[name="discount-type"]:checked')
            ?.value || "percentage",
      },
    };
  }
});
