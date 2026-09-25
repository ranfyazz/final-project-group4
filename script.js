// Renders events.js data into grouped-by-day cards, with search + category
// filtering. No backend — EVENTS is loaded from events.js as a plain array.

const listEl = document.getElementById("event-list");
const emptyStateEl = document.getElementById("empty-state");
const searchEl = document.getElementById("search");
const chips = document.querySelectorAll(".chip");

let activeCategory = "all";
let activeQuery = "";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDayHeading(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

function matchesFilters(event) {
  const inCategory = activeCategory === "all" || event.category === activeCategory;
  if (!inCategory) return false;

  if (!activeQuery) return true;
  const haystack = `${event.title} ${event.location} ${event.description}`.toLowerCase();
  return haystack.includes(activeQuery);
}

function groupByDate(events) {
  const groups = new Map();
  for (const event of events) {
    if (!groups.has(event.date)) groups.set(event.date, []);
    groups.get(event.date).push(event);
  }
  // Sort dates chronologically, and events within a day by time-of-day text
  // isn't reliable for AM/PM sorting, so we keep authoring order within a day.
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function render() {
  const today = todayISO();
  const filtered = EVENTS.filter(matchesFilters);
  const grouped = groupByDate(filtered);

  listEl.innerHTML = "";

  if (grouped.length === 0) {
    emptyStateEl.hidden = false;
    return;
  }
  emptyStateEl.hidden = true;

  for (const [date, events] of grouped) {
    const isToday = date === today;

    const groupEl = document.createElement("section");
    groupEl.className = "day-group";

    const heading = document.createElement("h2");
    heading.className = "day-heading" + (isToday ? " is-today" : "");
    heading.textContent = formatDayHeading(date) + (isToday ? " · Today" : "");
    groupEl.appendChild(heading);

    for (const event of events) {
      groupEl.appendChild(renderEventCard(event, isToday));
    }

    listEl.appendChild(groupEl);
  }
}

function renderEventCard(event, isToday) {
  const card = document.createElement("article");
  card.className = "event-card" + (isToday ? " is-today" : "");

  const time = document.createElement("div");
  time.className = "event-time";
  time.textContent = event.time;
  card.appendChild(time);

  const body = document.createElement("div");
  body.className = "event-body";

  const title = document.createElement("h3");
  title.className = "event-title";
  title.textContent = event.title;
  body.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "event-meta";
  meta.textContent = event.location;
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = event.category;
  meta.appendChild(tag);
  body.appendChild(meta);

  const description = document.createElement("p");
  description.className = "event-description";
  description.textContent = event.description;
  body.appendChild(description);

  card.appendChild(body);
  return card;
}

// ---- Event listeners ----

searchEl.addEventListener("input", (e) => {
  activeQuery = e.target.value.trim().toLowerCase();
  render();
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    activeCategory = chip.dataset.category;
    render();
  });
});

render();