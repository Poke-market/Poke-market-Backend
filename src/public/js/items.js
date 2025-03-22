document.addEventListener("DOMContentLoaded", function () {
  // Initialize elements
  initFilterToggle();
  initAddItemButton();
  initEditButtons();
  initDeleteButtons();
  initModalListeners();

  const sortSelect = document.getElementById("sort-select");

  sortSelect.addEventListener("change", function () {
    const selectedValue = this.value;
    const currentUrl = new URL(window.location.href);

    // Remove existing sort and order params and reset page
    currentUrl.searchParams.delete("sort");
    currentUrl.searchParams.delete("order");
    currentUrl.searchParams.delete("page");

    // Add new params based on selection
    if (selectedValue !== "default") {
      const [sort, order] = selectedValue.split("-");
      currentUrl.searchParams.set("sort", sort);
      currentUrl.searchParams.set("order", order);
    }

    window.location.href = currentUrl.href;
  });

  /**
   * Initialize delete buttons with modal confirmation
   */
  function initDeleteButtons() {
    const deleteButtons = document.querySelectorAll(".delete-btn");

    deleteButtons.forEach((button) => {
      if (button.id === "modal-confirm") return; // Skip the modal's confirm button

      button.addEventListener("click", function () {
        const itemId = this.getAttribute("data-id");
        const itemRow = this.closest(".item-row");
        const itemName = itemRow
          ? itemRow.querySelector(".item-name").textContent
          : "this item";

        showConfirmationModal(
          "Delete Item",
          `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
          () => deleteItem(itemId),
        );
      });
    });
  }

  /**
   * Initialize modal event listeners
   */
  function initModalListeners() {
    const modal = document.getElementById("confirmation-modal");
    const closeModal = document.querySelector(".close-modal");
    const modalCancel = document.getElementById("modal-cancel");

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
   * Show confirmation modal
   * @param {string} title The modal title
   * @param {string} message The modal message
   * @param {Function} onConfirm Callback function when confirmed
   */
  function showConfirmationModal(title, message, onConfirm) {
    const modal = document.getElementById("confirmation-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    const modalConfirm = document.getElementById("modal-confirm");

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
   * Hide the confirmation modal
   */
  function hideModal() {
    const modal = document.getElementById("confirmation-modal");
    if (modal) {
      modal.classList.remove("show");
    }
  }

  /**
   * Delete an item via API
   * @param {string} itemId The ID of the item to delete
   */
  async function deleteItem(itemId) {
    try {
      // Show loading indicator if available
      const notificationArea = document.querySelector(".notification");
      if (notificationArea) {
        notificationArea.textContent = "Deleting item...";
        notificationArea.className = "notification loading visible";
      }

      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete item");
      }

      // Show success message
      if (notificationArea) {
        notificationArea.textContent = "Item deleted successfully!";
        notificationArea.className = "notification success visible";
      }

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error deleting item:", error);

      // Show error message
      const notificationArea = document.querySelector(".notification");
      if (notificationArea) {
        notificationArea.textContent =
          error.message || "An error occurred while deleting the item.";
        notificationArea.className = "notification error visible";
      }
    }
  }

  function initFilterToggle() {
    const toggleFilterBtn = document.getElementById("toggle-filter-btn");
    const searchForm = document.getElementById("search-form");

    toggleFilterBtn.addEventListener("click", function () {
      if (searchForm.classList.contains("show")) {
        searchForm.classList.remove("show");
      } else {
        searchForm.classList.add("show");
        const searchInput = searchForm.querySelector(".search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }
    });
  }

  function initAddItemButton() {
    const addItemBtn = document.getElementById("add-item-btn");
    if (addItemBtn) {
      addItemBtn.addEventListener("click", function () {
        window.location.href = "/items/add";
      });
    }
  }

  function initEditButtons() {
    const editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const itemId = this.getAttribute("data-id");
        window.location.href = `/items/${itemId}/edit`;
      });
    });
  }
});
