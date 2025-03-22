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
  const form = document.getElementById("item-edit-form");
  const itemId = form.dataset.itemId;
  const cancelBtn = document.getElementById("cancel-btn");
  const discontinueItemBtn = document.getElementById("discontinue-item-btn");
  const deletePermanentBtn = document.getElementById(
    "delete-item-permanent-btn",
  );
  const notificationArea = document.getElementById("notification-area");
  const saveBtn = document.getElementById("save-btn");
  const isNewToggle = document.getElementById("isNewItem");
  const modal = document.getElementById("confirmation-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalConfirm = document.getElementById("modal-confirm");
  const modalCancel = document.getElementById("modal-cancel");
  const closeModal = document.querySelector(".close-modal");
  const availableTagsContainer = document.getElementById("available-tags");

  // Track form modified state
  let formModified = false;

  // Store selected tags
  let selectedTags = [];

  // Initialize tag data
  initTagsData();

  // Initialize all components
  initFormListeners();
  initToggleSwitches();
  initModalListeners();
  initValidation();
  initImagePreview();
  initTagSelection();

  // Initialize discount preview
  updateDiscountPreview();

  // Check for stored messages on page load
  checkStoredMessages();

  /**
   * Initialize tags data from the DOM
   */
  function initTagsData() {
    // Get all selected tags from their 'selected' class
    if (availableTagsContainer) {
      const tagElements = availableTagsContainer.querySelectorAll(
        ".available-tag.selected",
      );
      tagElements.forEach((tagElement) => {
        const tagName = tagElement.textContent.trim().toLowerCase();
        selectedTags.push(tagName);
      });
    }
  }

  /**
   * Initialize form event listeners
   */
  function initFormListeners() {
    // Price field
    document
      .getElementById("price")
      .addEventListener("input", debounce(updateDiscountPreview, 300));

    // Discount amount field
    document
      .getElementById("discount-amount")
      .addEventListener("input", debounce(updateDiscountPreview, 300));

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

    // Delete button (if exists)
    const deleteBtn = document.getElementById("delete-item-permanent-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", confirmPermanentDelete);
    }

    // Discontinue button (if exists)
    const discontinueBtn = document.getElementById("discontinue-item-btn");
    if (discontinueBtn) {
      discontinueBtn.addEventListener("click", confirmDiscontinue);
    }

    // Form field change tracking
    const formElements = form.querySelectorAll("input, textarea, select");
    formElements.forEach((element) => {
      element.addEventListener("change", () => {
        formModified = true;
      });

      // For text inputs, also track typing
      if (["text", "textarea", "number", "url"].includes(element.type)) {
        element.addEventListener("input", () => {
          formModified = true;

          // Clear error on the field when typing
          const fieldName = element.id;
          clearFieldError(fieldName);
        });
      }
    });
  }

  /**
   * Initialize clickable tag selection
   */
  function initTagSelection() {
    if (!availableTagsContainer) return;

    // Add click handlers to all available tags
    const tagElements =
      availableTagsContainer.querySelectorAll(".available-tag");
    tagElements.forEach((tagElement) => {
      tagElement.addEventListener("click", function () {
        const tagName = this.textContent.trim().toLowerCase();
        toggleTag(tagName, this);
      });
    });
  }

  /**
   * Toggle a tag's selection state
   */
  function toggleTag(tagName, tagElement) {
    if (selectedTags.includes(tagName)) {
      // Tag is already selected, so remove it
      selectedTags = selectedTags.filter((tag) => tag !== tagName);
      tagElement.classList.remove("selected");
    } else {
      // Tag is not selected, so add it
      selectedTags.push(tagName);
      tagElement.classList.add("selected");
    }

    // Mark form as modified
    formModified = true;

    // Clear any tag-related errors
    clearFieldError("tags");
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
        updateDiscountPreview();
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

    // Discount type change - already handled in initFormListeners

    // Initial discount preview
    updateDiscountPreview();
  }

  /**
   * Initialize image preview functionality
   */
  function initImagePreview() {
    const photoUrlInput = document.getElementById("photoUrl");
    const previewContainer = document.getElementById("image-preview");

    if (!photoUrlInput || !previewContainer) return;

    // Function to update preview
    function updatePreview() {
      const url = photoUrlInput.value.trim();

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
    }

    // Update on input change
    photoUrlInput.addEventListener("input", updatePreview);

    // Initial preview on page load
    updatePreview();
  }

  /**
   * Update discount preview
   */
  function updateDiscountPreview() {
    const price = parseFloat(document.getElementById("price").value) || 0;
    const discountAmount =
      parseFloat(document.getElementById("discount-amount").value) || 0;
    const discountType =
      document.querySelector('input[name="discount-type"]:checked')?.value ||
      "percentage";
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
    // New item toggle
    if (isNewToggle) {
      isNewToggle.addEventListener("change", function () {
        formModified = true;
        updateToggleStatus(this, "isNewItem");
      });

      // Initialize toggle status text
      updateToggleStatus(isNewToggle, "isNewItem");
    }
  }

  /**
   * Update toggle switch status text
   */
  function updateToggleStatus(toggleElement, toggleType) {
    const statusElement =
      toggleElement.parentElement.querySelector(".toggle-status");
    if (statusElement) {
      if (toggleType === "isNewItem") {
        statusElement.textContent = toggleElement.checked
          ? "Enabled"
          : "Disabled";
      }
    }
  }

  /**
   * Initialize modal listeners
   */
  function initModalListeners() {
    if (closeModal) {
      closeModal.addEventListener("click", hideModal);
    }

    if (modalCancel) {
      modalCancel.addEventListener("click", hideModal);
    }

    // Close modal when clicking outside
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        hideModal();
      }
    });
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
    const itemData = getFormData();

    try {
      // Set button to loading state
      setLoadingState(true);
      showNotification("Saving changes...", "loading");

      // Submit form data
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
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
      showNotification("Item details updated successfully.", "success");
      formModified = false;
    } catch (error) {
      console.error("Error updating item:", error);
      setLoadingState(false);
      showNotification("Error updating item: " + error.message, "error");
    }
  }

  /**
   * Set button loading state
   */
  function setLoadingState(loading) {
    if (!saveBtn) return;

    if (loading) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    } else {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
    }
  }

  /**
   * Handle cancel button click
   */
  function handleCancel() {
    if (formModified) {
      confirmDiscard();
    } else {
      // No changes, return to item list
      window.location.href = "/items";
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
      window.location.href = "/items";
    };

    showModal();
  }

  /**
   * Confirm before discontinuing the item
   */
  function confirmDiscontinue() {
    modalTitle.textContent = "Discontinue Item";
    modalMessage.textContent =
      "This will mark the item as discontinued. It will no longer appear in the main catalog but will remain in the database for order history. Continue?";

    // Set up confirm button action
    modalConfirm.onclick = discontinueItem;

    showModal();
  }

  /**
   * Mark an item as discontinued
   */
  async function discontinueItem() {
    try {
      setLoadingState(true);
      showNotification("Marking item as discontinued...", "loading");

      const response = await fetch(`/api/items/${itemId}/discontinue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("Item marked as discontinued successfully", "success");
        // Store success message in session storage and redirect
        sessionStorage.setItem(
          "itemMessage",
          "Item marked as discontinued successfully",
        );
        window.location.href = "/items";
      } else {
        showNotification(data.message || "Failed to discontinue item", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("An unexpected error occurred", "error");
    } finally {
      setLoadingState(false);
      hideModal();
    }
  }

  /**
   * Confirm before permanently deleting the item
   */
  function confirmPermanentDelete() {
    modalTitle.textContent = "Delete Item Permanently";
    modalMessage.textContent =
      "WARNING: This will permanently delete this item and all associated data. This action CANNOT be undone. Are you absolutely sure?";

    // Set up confirm button action
    modalConfirm.onclick = deletePermanently;

    showModal();
  }

  /**
   * Delete an item permanently
   */
  async function deletePermanently() {
    try {
      setLoadingState(true);
      showNotification("Deleting item permanently...", "loading");

      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("Item deleted permanently", "success");
        // Store success message in session storage and redirect
        sessionStorage.setItem("itemMessage", "Item permanently deleted");
        window.location.href = "/items";
      } else {
        showNotification(data.message || "Failed to delete item", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("An unexpected error occurred", "error");
    } finally {
      setLoadingState(false);
      hideModal();
    }
  }

  /**
   * Validate the form
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

    // If not valid, scroll to the first error field
    if (!isValid && firstErrorField) {
      scrollToErrorField(firstErrorField);
    }

    return isValid;
  }

  /**
   * Get form data from form fields
   * @returns {Object} Form data object
   */
  function getFormData() {
    // Build the form data object
    return {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      category: document.getElementById("category").value,
      photoUrl: document.getElementById("photoUrl").value,
      price: parseFloat(document.getElementById("price").value),
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

  /**
   * Handle submit errors
   * @param {Object} data Error data from API
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
      showNotification(data.message || "Error updating item.", "error");
    }
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
   * Show notification
   * @param {string} message Notification message
   * @param {string} type Notification type (success, error, loading)
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
   * Show confirmation modal
   */
  function showModal() {
    if (modal) {
      modal.classList.add("show");
    }
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
   * Check for stored item messages
   */
  function checkStoredMessages() {
    const itemMessage = sessionStorage.getItem("itemMessage");
    if (itemMessage) {
      showNotification(itemMessage, "success");
      sessionStorage.removeItem("itemMessage");
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
});
