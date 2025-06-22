/** @format */

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportJsonBtn");
const importFileInput = document.getElementById("importFile");

let quotes = [];

// --- Load Quotes from Local Storage ---
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch (e) {
      console.error("Invalid JSON in localStorage");
    }
  } else {
    // Initial default quotes
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

// --- Save Quotes to Local Storage ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// --- Show Random Quote & Store Last Viewed in Session Storage ---
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(
          (q) => q.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  // Use textContent instead of innerHTML to avoid injection issues
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
}

// --- Add New Quote ---
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  addCategoryOption(category);

  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
  showRandomQuote();
}

// --- Add Unique Categories to Dropdown ---
function populateCategories() {
  categoryFilter.innerHTML = `<option value="all">All</option>`;
  const categories = [...new Set(quotes.map((q) => q.category))];
  categories.forEach(addCategoryOption);
}

function addCategoryOption(category) {
  if (
    ![...categoryFilter.options].some(
      (o) => o.value.toLowerCase() === category.toLowerCase()
    )
  ) {
    const opt = document.createElement("option");
    opt.value = category;
    opt.textContent = category;
    categoryFilter.appendChild(opt);
  }
}

// --- Export Quotes to JSON File ---
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  downloadLink.click();
  URL.revokeObjectURL(url);
}

// --- Import Quotes from JSON File ---
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      importedQuotes.forEach((q) => {
        if (q.text && q.category) quotes.push(q);
      });
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
      showRandomQuote();
    } catch (err) {
      alert("Failed to import quotes: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Initialize App ---
function init() {
  loadQuotes();
  populateCategories();

  // Load last session's quote if available
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const q = JSON.parse(last);
    quoteDisplay.textContent = `"${q.text}" — (${q.category})`;
  } else {
    showRandomQuote();
  }
}

newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categoryFilter.addEventListener("change", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFileInput.addEventListener("change", importFromJsonFile);

init();
