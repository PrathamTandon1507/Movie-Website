import { useState, useEffect } from "react";

const KEY = "ab99ce58";
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];
export function useMovies(query) {
  const [movies, setMovies] = useState(tempMovieData);
  // const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      //   callback?.();
      const controller = new AbortController(); //to avoid multiple fetches while searching for the movie, it will only search final letter
      async function fetchMovies() {
        try {
          setError("");
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("Something went wrong with fetching movies");
          }
          const data = await res.json();
          if (data.Response === "False") {
            throw new Error("Movie not available!");
          }
          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false); //because we need to set this to false if there is an error or when the page loads, so either way it needs to become false thats why finally
        }
      }

      if (query.length < 2) {
        setError("");
        setMovies([]);
        return;
      }
      //   handleCloseMovie();
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  ); //fetching takes place after the page has been rendered [this side effect does not lead to infintite re-rendering due to useEffect] | side-effect : Reaction b/w REACT component and anythign outside that component [http/timers/api's]
  return { movies, isLoading, error };
}
