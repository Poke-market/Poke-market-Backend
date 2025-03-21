document.addEventListener("DOMContentLoaded", function () {
  // Initialize elements
  initFilterToggle();
  initAddItemButton();

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

  // delete buttons add event listeners
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const itemId = this.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this item?")) {
        deleteItem(itemId);
      }
    });
  });

  // a function to delete an item
  async function deleteItem(itemId) {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Server responded with status: ${response.status}`,
        );
      }

      const data = await response.json();

      // Show success message
      alert("Item successfully deleted");

      // Navigate to the first page instead of reloading the current page
      // This prevents 500 errors when deleting the last item on a page
      const url = new URL(window.location.href);
      url.searchParams.set("page", "1");
      window.location.href = url.toString();
    } catch (error) {
      console.error("Error:", error);
      alert(`An error occurred while deleting the item: ${error.message}`);
    }
  }
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
 * Initialize the Add Item button
 */
function initAddItemButton() {
  const addItemBtn = document.getElementById("add-item-btn");
  if (!addItemBtn) return;

  addItemBtn.addEventListener("click", () => {
    window.location.href = "/items/add";
  });
}
