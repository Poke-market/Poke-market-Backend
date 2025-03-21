document.addEventListener("DOMContentLoaded", () => {
  // Initialize sort functionality
  initSortSelect();
  // Initialize delete buttons
  initDeleteButtons();
});

/**
 * Initialize the sort select dropdown functionality
 */
function initSortSelect() {
  const sortSelect = document.getElementById("sort-select");
  if (!sortSelect) return;

  sortSelect.addEventListener("change", (e) => {
    // Get current URL and parameters
    const url = new URL(window.location.href);
    const params = url.searchParams;

    // Parse the selected value (format: field-order)
    const [sort, order] = e.target.value.split("-");

    // Update sort parameters
    params.set("sort", sort);
    params.set("order", order);

    // Reset to page 1 when sorting changes
    params.set("page", "1");

    // Navigate to new URL
    window.location.href = url.toString();
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

      // Confirm before deleting
      if (
        !confirm(
          "Are you sure you want to delete this user? This action cannot be undone.",
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

        const data = await response.json();

        if (response.ok) {
          // Success - remove the row or reload the page
          const userRow = button.closest(".user-row");
          if (userRow) {
            userRow.style.backgroundColor = "#ffebee";
            userRow.style.opacity = "0.5";
            setTimeout(() => {
              userRow.remove();
              // Update counter
              updateUserCounter(-1);
            }, 300);
          } else {
            // Fallback - reload the page
            window.location.reload();
          }
        } else {
          // Error
          showNotification("error", data.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        showNotification("error", "An error occurred while deleting the user");
      }
    });
  });
}

/**
 * Update the user counter display
 * @param {number} change - The change in count (usually -1 when deleting)
 */
function updateUserCounter(change) {
  const counterEl = document.querySelector(".view-options span");
  if (!counterEl) return;

  const text = counterEl.textContent;
  const currentCount = parseInt(text.match(/\d+/)[0], 10);
  const newCount = currentCount + change;

  counterEl.textContent = `Showing ${newCount} users`;
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

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }
}
