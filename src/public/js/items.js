document.addEventListener("DOMContentLoaded", function () {
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

  // a function to delte an item
  async function deleteItem(itemId) {
    try {
      // check for jwt token
      const token = localStorage.getItem("jwt") || "";

      // delete request to server needs to be send with a token
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      // check if response is not ok
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Server responded with status: ${response.status}`,
        );
      }

      const data = await response.json();

      //show success message and reload the page
      if (data.status === "success") {
        alert("Item successfully deleted");
        window.location.reload();
      } else {
        // if not ok show an error message
        alert("Item deleted successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`An error occurred while deleting the item: ${error.message}`);
    }
  }
});
