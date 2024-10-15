// Wait for the DOM content to load before starting the application
document.addEventListener("DOMContentLoaded", startApp);

function startApp() {
  // DOM element references
  const poster = document.getElementById("poster");
  const titleElement = document.getElementById("title");
  const runtimeElement = document.getElementById("runtime");
  const descriptionElement = document.getElementById("film-info");
  const showtimeElement = document.getElementById("showtime");
  const ticketNumElement = document.getElementById("ticket-num");
  const buyTicketButton = document.getElementById("buy-ticket");
  const movieListContainer = document.getElementById("films");

  // Load the list of movies into the UI
  loadMovies(movieListContainer); 
  // Load details of the first movie initially
  loadFirstMovie(); 
}

// Function to fetch and load all movies into the provided container
function loadMovies(container) {
  fetch("http://localhost:3000/films")
    .then((response) => response.json())
    .then((movies) => {
      // Clear previous content in the container
      container.innerHTML = ""; 
      // Create a list item for each movie and append to the container
      movies.forEach((movie) => createMovieListItem(container, movie)); 
    });
}

// Function to create a list item for a movie and attach click event
function createMovieListItem(container, movie) {
  const li = document.createElement("li");
  li.classList.add("film", "item");
  li.textContent = movie.title;
  li.setAttribute("data-id", movie.id); 

  // Add a delete button for each movie item
  addDeleteButton(li, movie.id); 

  // Add click event listener to fetch and display movie details
  li.addEventListener("click", () => {
    fetchMovieDetails(movie.id); 
  });

  // Append the list item to the container
  container.appendChild(li); 
}

// Function to add a delete button to a movie list item
function addDeleteButton(li, movieId) {
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-button", "ui", "red", "button");

  // Add click event listener to delete the movie from the server
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent event bubbling to the li element
    deleteMovie(movieId, li); 
  });

  // Append the delete button to the movie list item
  li.appendChild(deleteButton); 
}

// Function to delete a movie from the server and remove its UI representation
function deleteMovie(movieId, listItem) {
  fetch(`http://localhost:3000/films/${movieId}`, { 
    method: "DELETE", 
  }).then(() => {
    listItem.remove(); // Remove the list item from the UI
  });
}

// Function to load details of the first movie initially
function loadFirstMovie() {
  fetch("http://localhost:3000/films/1")
    .then((response) => response.json())
    .then((movie) => displayMovieDetails(movie)); 
}

// Function to fetch details of a specific movie by its ID
function fetchMovieDetails(movieId) {
  fetch(`http://localhost:3000/films/${movieId}`)
    .then((response) => response.json())
    .then((movie) => displayMovieDetails(movie));
}

// Function to update the UI with details of a specific movie
function displayMovieDetails(movie) {
  const availableTickets = movie.capacity - movie.tickets_sold;
  updateMovieUI(movie, availableTickets); 
  updateBuyTicketButton(movie, availableTickets); 
}

// Function to update the UI elements with movie details
function updateMovieUI(movie, availableTickets) {
  document.getElementById("poster").src = movie.poster;
  document.getElementById("title").textContent = movie.title;
  document.getElementById("runtime").textContent = `${movie.runtime} minutes`; 
  document.getElementById("film-info").textContent = movie.description;
  document.getElementById("showtime").textContent = movie.showtime;
  document.getElementById("ticket-num").textContent = `${availableTickets} remaining tickets`; 

  // Update the movie list item's UI based on ticket availability
  const movieListItem = document.querySelector(`li[data-id="${movie.id}"]`); 
  if (availableTickets === 0) {
    movieListItem.classList.add("sold-out"); 
  } else {
    movieListItem.classList.remove("sold-out"); 
  }
}

// Function to update the "Buy Ticket" button based on ticket availability
function updateBuyTicketButton(movie, availableTickets) {
  const buyTicketButton = document.getElementById("buy-ticket");
  if (availableTickets === 0) {
    buyTicketButton.textContent = "Sold Out";
    buyTicketButton.disabled = true; 
  } else {
    buyTicketButton.textContent = "Buy Ticket";
    buyTicketButton.disabled = false; 
    buyTicketButton.onclick = () => buyTicket(movie); 
  }
}

// Function to simulate buying a ticket for a movie
function buyTicket(movie) {
  const availableTickets = movie.capacity - movie.tickets_sold;

  // If tickets are available, update server and UI with new ticket count
  if (availableTickets > 0) {
    const updatedTicketsSold = movie.tickets_sold + 1;

    fetch(`http://localhost:3000/films/${movie.id}`, { 
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tickets_sold: updatedTicketsSold }), 
    })
      .then((response) => response.json())
      .then((updatedMovie) => {
        displayMovieDetails(updatedMovie); 
      });
  }
}
