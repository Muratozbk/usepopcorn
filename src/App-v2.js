import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = '1ca62e06';

export default function App() {

  const [query, setQuery] = useState("tokyo");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(() => {
    const storedValue = localStorage.getItem("watched");
    try {
      return storedValue ? JSON.parse(storedValue) : [];
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  });

  function handleSelectMovie(id) {
    setSelectedId(selectedId => selectedId === id ? null : id);
  };

  function handleCloseMovie() {
    setSelectedId(null);
  };

  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie]);
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
  };

  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter(movie =>
      movie.imdbID !== id))
  };

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError('');

        const res = await
          fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal });

        if (!res.ok) throw new Error('Something went wrong with fetching movies')

        const data = await res.json();

        if (data.Response === 'False') throw new Error('Movie not found');

        setMovies(data.Search);
        setError('');
      } catch (err) {

        if (err.name !== "AbortError")
          setError(err.message)
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setError('');
      return;
    }
    handleCloseMovie();
    fetchMovies();

    return () => {
      controller.abort()
    };
  }, [query]);

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>

      <Main >
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies}
            onSelectMovie={handleSelectMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? <MovieDetails selectedId={selectedId}
            onCloseMovie={handleCloseMovie}
            onAddWatched={handleAddWatched}
            watched={watched} />
            :
            (<>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched}
                onDelete={handleDeleteWatched} />
            </>)}
        </Box>
      </Main>
    </>
  )
};

function Loader() {
  return <p className="loader">Loading...</p>
};

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  )
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  )
};

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
};

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(() => {
    function callback(e) {
      if (document.activeElement === inputEl.current)
        return;

      if (e.code === 'Enter') {
        inputEl.current.focus();
        setQuery("")
      }
    }
    document.addEventListener('keydown', callback)
    return () => document.addEventListener('keydown', callback)
  }, [setQuery]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  )
};

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length} </strong> results
    </p>
  )
}

function Main({ children }) {

  return (
    <main className="main">
      {children}
    </main>
  )
};

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  )
};

function MovieList({ movies, onSelectMovie }) {

  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID}
          onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  )
};

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
};

function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const isWatched =
    watched.map(movie => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(movie => movie.imdbID ===
    selectedId)?.userRating;

  const { Title: title, Year: year, Poster: poster,
    Runtime: runtime, imdbRating, Plot: plot, Released: released,
    Actors: actors, Director: director, Genre: genre } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating
    };

    onAddWatched(newWatchedMovie)
    onCloseMovie();
  }

  useEffect(() => {
    function callback(e) {
      if (e.code === "Escape") {
        onCloseMovie();
      }
    };
    document.addEventListener("keydown", callback);

    return function () {
      document.removeEventListener("keydown", callback)
    }
  }, [onCloseMovie]);

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true)
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId])

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;

    return () => {
      document.title = "usePopcorn";
    }
  }, [title]);

  return (
    <div className="details">
      {isLoading ? <Loader /> :
        (<>
          <header>
            <button className="btn-back"
              onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={title} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released} &bull; {runtime} </p>
              <p>{genre} </p>
              <p><span>⭐</span>{imdbRating} IMBD rating</p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating maxRating={10} size={26}
                    onSetRating={setUserRating} />

                  {userRating > 0 && <button className="btn-add"
                    onClick={handleAdd}>
                    + Add to list
                  </button>}
                </>)
                : (
                  <p>You rated with movie {watchedUserRating}
                    <span>⭐</span> </p>
                )}
            </div>
            <p> <em>{plot} </em> </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>)}

    </div>
  )
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
          <span>{Number(avgImdbRating).toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{Number(avgUserRating).toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Number(avgRuntime).toFixed(1)} min</span>
        </p>
      </div>
    </div>
  )
};

function WatchedMovieList({ watched, onDelete }) {
  return (
    <ul className="list box2">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID}
          onDelete={onDelete} />
      ))}
    </ul>
  )
};

function WatchedMovie({ movie, onDelete }) {
  return (
    <li >
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button className="btn-delete"
          onClick={() => onDelete(movie.imdbID)}>X</button>
      </div>
    </li>
  )
}