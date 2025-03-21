/**
 * Users page management
 * Handles sorting, filtering, and delete operations
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize elements
  initFilterToggle();
  initSortSelect();
  initDeleteButtons();
  initAddUserButton();
});

/**
 * Initialize the filter toggle button
 */
function initFilterToggle() {
  const filterBtn = document.getElementById("toggle-filter-btn");
  if (!filterBtn) return;

  filterBtn.addEventListener("click", () => {
    const searchForm = document.getElementById("search-form");
    if (searchForm) {
      searchForm.classList.toggle("show");
    }
  });
}

/**
 * Initialize the sort select dropdown
 */
function initSortSelect() {
  const sortSelect = document.getElementById("sort-select");
  if (!sortSelect) return;

  sortSelect.addEventListener("change", () => {
    const selectedValue = sortSelect.value;
    const url = new URL(window.location.href);

    // Remove existing sort and order params and reset page
    url.searchParams.delete("sort");
    url.searchParams.delete("order");
    url.searchParams.delete("page");

    // Add new params based on selection
    if (selectedValue !== "default") {
      const [sort, order] = selectedValue.split("-");
      url.searchParams.set("sort", sort);
      url.searchParams.set("order", order);
    }

    // Navigate to the new URL
    window.location.href = url.toString();
  });
}

/**
 * Initialize the Add User button
 */
function initAddUserButton() {
  const addUserBtn = document.getElementById("add-user-btn");
  if (!addUserBtn) return;

  addUserBtn.addEventListener("click", () => {
    window.location.href = "/users/add";
  });
}

/**
 * Initialize delete functionality for user rows
 */
function initDeleteButtons() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();

      const userId = button.dataset.id;
      const userName = button.dataset.name;

      // Confirm before deleting
      if (
        !confirm(
          `Are you sure you want to delete ${userName}? This action cannot be undone.`,
        )
      ) {
        return;
      }

      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Success - animate and remove the row
          const userRow = button.closest(".user-row");
          if (userRow) {
            // Visual feedback
            userRow.style.backgroundColor = "#ffebee";
            userRow.style.opacity = "0.5";
            userRow.style.transition = "all 0.3s ease";

            // Remove after animation
            setTimeout(() => {
              userRow.remove();
              updateUserCounter(-1);
              showNotification("success", `User ${userName} has been deleted.`);
            }, 300);
          } else {
            // Fallback - reload the page
            window.location.reload();
          }
        } else {
          // Handle error response
          const data = await response.json();
          showNotification(
            "error",
            data.message || data.data.errors[0] || "Error deleting user",
          );
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        showNotification("error", "An error occurred while deleting the user");
      }
    });
  });
}

/**
 * Update the user counter after deleting a user
 * @param {number} change - The amount to change the counter by (-1 for deletion)
 */
function updateUserCounter(change) {
  const counterSpan = document.querySelector(".view-options span");
  if (!counterSpan) return;

  const text = counterSpan.textContent;
  const matches = text.match(/Showing (\d+) of (\d+) users/);

  if (matches && matches.length === 3) {
    const showing = parseInt(matches[1]) + change;
    const total = parseInt(matches[2]) + change;
    counterSpan.textContent = `Showing ${showing} of ${total} users`;
  }
}

/**
 * Show a notification message
 * @param {string} type - The type of notification ('error', 'success')
 * @param {string} message - The message to display
 */
function showNotification(type, message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to page
  const container = document.querySelector(".users-container");
  if (container) {
    container.insertBefore(notification, container.firstChild);

    // Style the notification
    Object.assign(notification.style, {
      padding: "10px 15px",
      marginBottom: "15px",
      borderRadius: "4px",
      fontWeight: "500",
      opacity: "0",
      transition: "opacity 0.3s ease",
    });

    if (type === "error") {
      Object.assign(notification.style, {
        backgroundColor: "#ffebee",
        color: "#c62828",
        border: "1px solid #ef9a9a",
      });
    } else if (type === "success") {
      Object.assign(notification.style, {
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
        border: "1px solid #a5d6a7",
      });
    }

    // Make visible after a small delay (for transition)
    setTimeout(() => {
      notification.style.opacity = "1";
    }, 10);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }
}
