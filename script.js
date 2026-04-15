console.log("Frontend loaded");

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("loginMessage");

    if (!username || !password) {
      msg.textContent = "Please fill all fields";
      msg.style.color = "red";
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      msg.textContent = data.message;
      msg.style.color = data.success ? "lightgreen" : "red";

      if (data.success) {
        localStorage.setItem("loggedInUser", username);
        setTimeout(() => {
          window.location.href = "/dashboard.html";
        }, 700);
      }
    } catch (error) {
      msg.textContent = "Login failed";
      msg.style.color = "red";
    }
  });
}

// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const msg = document.getElementById("registerMessage");

    if (!username || !password) {
      msg.textContent = "Please fill all fields";
      msg.style.color = "red";
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      msg.textContent = data.message;
      msg.style.color = data.success ? "lightgreen" : "red";

      if (data.success) {
        registerForm.reset();
      }
    } catch (error) {
      msg.textContent = "Something went wrong";
      msg.style.color = "red";
    }
  });
}

// DASHBOARD
const dashboardUsername = document.getElementById("dashboardUsername");
const userInfoName = document.getElementById("userInfoName");
const logoutBtn = document.getElementById("logoutBtn");

if (dashboardUsername && userInfoName) {
  const loggedInUser = localStorage.getItem("loggedInUser");

  if (!loggedInUser) {
    window.location.href = "/login.html";
  } else {
    dashboardUsername.textContent = loggedInUser;
    userInfoName.textContent = loggedInUser;
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("loggedInUser");
    window.location.href = "/login.html";
  });
}

// SEND MESSAGE
const sendForm = document.getElementById("sendForm");

if (sendForm) {
  sendForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const to = document.getElementById("toUser").value.trim();
    const msgText = document.getElementById("messageText").value.trim();
    const from = localStorage.getItem("loggedInUser");
    const msg = document.getElementById("sendMsg");

    if (!from) {
      msg.textContent = "Please login first";
      msg.style.color = "red";
      return;
    }

    if (!to || !msgText) {
      msg.textContent = "Please fill all fields";
      msg.style.color = "red";
      return;
    }

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ from, to, message: msgText })
      });

      const data = await res.json();
      msg.textContent = data.message;
      msg.style.color = data.success ? "lightgreen" : "red";

      if (data.success) {
        sendForm.reset();
      }
    } catch (error) {
      msg.textContent = "Failed to send message";
      msg.style.color = "red";
    }
  });
}

// LOAD INBOX
async function loadInbox() {
  const messagesDiv = document.getElementById("messages");
  if (!messagesDiv) return;

  const username = localStorage.getItem("loggedInUser");
  if (!username) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch(`/api/inbox/${username}`);
    const data = await res.json();

    if (!data.length) {
      messagesDiv.innerHTML = `<div class="message-card"><p>No messages yet.</p></div>`;
      updateInboxBadge(0);
      return;
    }

    messagesDiv.innerHTML = data
      .map(
        (msg) => `
        <div class="message-card">
          <strong>From: ${msg.sender}</strong>
          <p>${msg.ciphertext}</p>
        </div>
      `
      )
      .join("");

    updateInboxBadge(data.length);
  } catch (error) {
    messagesDiv.innerHTML = `<div class="message-card"><p>Failed to load inbox.</p></div>`;
  }
}

// BADGE
function updateInboxBadge(count) {
  const badge = document.getElementById("inboxBadge");
  if (!badge) return;

  if (count > 0) {
    badge.style.display = "inline-flex";
    badge.textContent = count > 9 ? "9+" : count;
  } else {
    badge.style.display = "none";
    badge.textContent = "";
  }
}

// refresh badge on pages that have it
async function refreshInboxBadgeOnly() {
  const badge = document.getElementById("inboxBadge");
  if (!badge) return;

  const username = localStorage.getItem("loggedInUser");
  if (!username) {
    updateInboxBadge(0);
    return;
  }

  try {
    const res = await fetch(`/api/inbox/${username}`);
    const data = await res.json();
    updateInboxBadge(Array.isArray(data) ? data.length : 0);
  } catch (error) {
    updateInboxBadge(0);
  }
}

if (document.getElementById("messages")) {
  loadInbox();
} else {
  refreshInboxBadgeOnly();
}