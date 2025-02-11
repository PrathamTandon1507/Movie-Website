import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr?.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useState(function () {
    const watchedMovie = JSON.parse(localStorage.getItem("watched"));
    return watchedMovie;
  });
  // const [watched, setWatched] = useState(tempWatchedData);
  const { movies, isLoading, error } = useMovies(query);

  function handleOpenMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((m) => m.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  ); //updates localStorage whenever watched is updated, due to useEffect

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") handleCloseMovie();
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback); //CLEANUP: because event listeners will keep on accumulating with each time a movie is closed, so it will be checked multiple times
      };
    },
    [setSelectedId]
  );

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Results movies={movies} /> {/*because we need to pass movie prop*/}
      </Navbar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectedId={handleOpenMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">LOADING</p>;
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEle = useRef(null);

  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputEle.current) return;
        if (e.code === "Enter") {
          inputEle.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callback);
      return () => document.removeEventListener("keydown", callback);
    },
    [setQuery]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEle}
    />
  );
}

function Results({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <Button isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} onSelectedId={onSelectedId} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectedId }) {
  return (
    <li key={movie.imdbID} onClick={() => onSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Button({ isOpen, setIsOpen }) {
  return (
    <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
      {isOpen ? "–" : "+"}
    </button>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movieData, setMovieData] = useState({});
  const [movieLoading, setMovieLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1;
    },
    [userRating]
  );
  function handleUserRating(rating) {
    setUserRating(rating);
  }
  const KEY = "ab99ce58";
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieData;
  const starStyle = {
    fontSize: "10px",
  };
  useEffect(
    function () {
      async function fetchMovieById() {
        setMovieLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );

        const data = await res.json();
        setMovieData(data);
        setMovieLoading(false);
      }
      fetchMovieById();
    },
    [selectedId, setMovieLoading]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie - ${title}`;

      return function () {
        //cleanup function : whenever the state is closed but the effect is still running, it will be reset
        document.title = "usePopcorn";
      };
    },
    [title]
  );
  function handleAdd() {
    const watchedMovie = {
      imdbID: selectedId,
      title,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      poster,
      userRating: Number(userRating),
      countRatingDecisons: countRef.current,
    };
    onAddWatched(watchedMovie);
    onCloseMovie();
  }
  return movieLoading ? (
    <Loader />
  ) : (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
        <img src={poster} alt={`Poster of the movie: ${title}`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>{released}</p>
          <p>{genre}</p>
          <p>
            ⭐<span>{imdbRating} IMDB Rating</span>
          </p>
        </div>
      </header>

      <section>
        <div className="rating">
          {isWatched ? (
            <p>
              You rated this movie{" "}
              <span style={starStyle}>
                {Array.from({ length: watchedRating }, (_, i) => "⭐")}
              </span>
            </p>
          ) : (
            <>
              <StarRating
                size={24}
                maximum="10"
                onUserRating={handleUserRating}
              />
              {userRating > 0 ? (
                <button className="btn-add" onClick={handleAdd}>
                  + Add to list
                </button>
              ) : (
                ""
              )}
            </>
          )}
        </div>

        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating ? movie.imdbRating : "N/A"}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
