/** @format */

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

let quotes = [];

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch (e) {
      console.error("Invalid quotes JSON.");
      quotes = [];
    }
  }

  if (quotes.length === 0) {
    quotes = [
      {
        text: "Success is not final; failure is not fatal.",
        category: "Motivation",
      },
      {
        text: "Be yourself; everyone else is already taken.",
        category: "Inspiration",
      },
      {
        text: "Life is what happens when you're busy making other plans.",
        category: "Life",
      },
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filtered =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(
          (q) => q.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — (${random.category})`;

  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Both fields required.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
  showRandomQuote();
}

function populateCategories() {
  const selected = localStorage.getItem("selectedCategory") || "all";

  const categories = [...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  if ([...categoryFilter.options].some((opt) => opt.value === selected)) {
    categoryFilter.value = selected;
  } else {
    categoryFilter.value = "all";
  }
}

const SERVER_API_URL = "https://jsonplaceholder.typicode.com/posts";
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    // Simulated quote data from server
    const simulatedQuotes = serverData.slice(0, 5).map((post) => ({
      text: post.title,
      category: "Server",
    }));

    resolveConflicts(simulatedQuotes);
  } catch (error) {
    console.error("Failed to fetch server quotes:", error);
  }
}

function resolveConflicts(serverQuotes) {
  let localQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");

  let newQuotes = [];
  for (let sq of serverQuotes) {
    const exists = localQuotes.some(
      (lq) => lq.text === sq.text && lq.category === sq.category
    );
    if (!exists) {
      newQuotes.push(sq);
    }
  }

  if (newQuotes.length > 0) {
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
    notifyUser(`${newQuotes.length} new quote(s) synced from server.`);
  }
}

function notifyUser(message) {
  const alertBox = document.createElement("div");
  alertBox.textContent = message;
  alertBox.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: #333; color: #fff; padding: 10px 20px;
    border-radius: 5px; z-index: 9999;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(alertBox);
  setTimeout(() => alertBox.remove(), 4000);
}

function init() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    quoteDisplay.textContent = `"${q.text}" — (${q.category})`;
  } else {
    showRandomQuote();
  }

  const selectedCategory = localStorage.getItem("selectedCategory");
  if (
    selectedCategory &&
    [...categoryFilter.options].some((o) => o.value === selectedCategory)
  ) {
    categoryFilter.value = selectedCategory;
    showRandomQuote();
  }

  setInterval(fetchServerQuotes, 15000);
}

newQuoteBtn.addEventListener("click", showRandomQuote);
init();
