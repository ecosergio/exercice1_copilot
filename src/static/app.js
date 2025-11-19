document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Register delete event listener ONCE
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-participant")) {
      const button = event.target;
      const email = button.getAttribute("data-email");
      const activity = button.getAttribute("data-activity");
      try {
        const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, { method: "DELETE" });
        if (response.ok) fetchActivities();
      } catch (error) {
        console.error("Error unregistering participant:", error);
      }
    }
  });

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        // Add event listener for delete participant
        activitiesList.addEventListener("click", async (event) => {
          if (event.target.classList.contains("delete-participant")) {
            const button = event.target;
            const email = button.getAttribute("data-email");
            const activity = button.getAttribute("data-activity");

            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
                method: "DELETE",
              });
              if (response.ok) fetchActivities();
            } catch (error) {
              console.error("Error unregistering participant:", error);
            }
          }
        });
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants list HTML
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list">
                ${details.participants.map(email => `
                  <li style="list-style-type: none; display: flex; align-items: center;">
                    <span>${email}</span>
                    <button class="delete-participant" data-email="${email}" data-activity="${name}" style="margin-left: 10px;">❌</button>
                  </li>
                `).join("")}
              </ul>
            </div>
          `;
        } else {
            participantsHTML = `
              <div class="participants-section">
                <strong>Participants:</strong>
                <span class="no-participants">No one signed up yet.</span>
              </div>
            `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();
      fetchActivities();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
