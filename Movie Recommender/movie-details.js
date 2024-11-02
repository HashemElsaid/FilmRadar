const tmdbApiKey = '0b93e314138aadfc8300d5eda801e2b1'; // Replace with your TMDB API key

// Get movieId from URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movieId');

// Function to go back to the previous page
function goBack() {
    window.history.back();
}

// Fetch and display movie details
async function fetchMovieDetails() {
    const detailsContainer = document.getElementById('movie-details');
    detailsContainer.innerHTML = '<p>Loading...</p>'; // Loading indicator

    const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}&language=en-US`;
    const castUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${tmdbApiKey}&language=en-US`;

    try {
        // Fetch movie info and cast details concurrently
        const [movieResponse, castResponse] = await Promise.all([
            fetch(movieUrl),
            fetch(castUrl)
        ]);

        const movieData = await movieResponse.json();
        const castData = await castResponse.json();

        // Display movie details and cast
        displayMovieDetails(movieData, castData.cast);
    } catch (error) {
        console.error("Error fetching movie details:", error);
        detailsContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
    }
}

function displayMovieDetails(movieData, cast) {
    const detailsContainer = document.getElementById('movie-details');
    const posterUrl = movieData.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` 
        : 'path/to/fallback-image.jpg';

    detailsContainer.innerHTML = `
        <button onclick="goBack()" class="back-button">← Back</button>
        <h2>${movieData.title} (${movieData.release_date ? movieData.release_date.split('-')[0] : 'N/A'})</h2>
        <img src="${posterUrl}" alt="${movieData.title}" class="movie-details-poster">

        <div class="movie-info">
            <p class="overview"><strong>Overview:</strong> ${movieData.overview}</p>
            <p><strong>Release Date:</strong> ${movieData.release_date}</p>
            <p><strong>Rating:</strong> ${movieData.vote_average.toFixed(1)}/10</p>
        </div>

        <h3>Cast</h3>
        <div class="cast-grid">
            ${cast.slice(0, 10).map(actor => `
                <div class="cast-item">
                    <img src="https://image.tmdb.org/t/p/w185${actor.profile_path}" alt="${actor.name}" class="cast-photo">
                    <p>${actor.name} as ${actor.character}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Call the function to fetch movie details
fetchMovieDetails();
