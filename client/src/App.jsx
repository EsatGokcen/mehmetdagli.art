import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./index.css"; // use Tailwind's stylesheet, not App.css

function App() {
  const [count, setCount] = useState(0);
  const [apiHealth, setApiHealth] = useState(null);

  // Optional: test connection to FastAPI backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then((res) => res.json())
      .then(setApiHealth)
      .catch(() => setApiHealth({ status: "backend offline" }));
  }, []);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="flex gap-4 items-center mb-6">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="h-16 w-16" alt="React logo" />
        </a>
      </div>

      {/* Card */}
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl font-bold mb-4">
            Vite + React + DaisyUI
          </h2>
          <p className="mb-4">
            This project uses{" "}
            <span className="font-semibold text-primary">TailwindCSS</span> and{" "}
            <span className="font-semibold text-secondary">DaisyUI</span>.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <p className="mt-3 text-sm opacity-70">
            Edit <code>src/App.jsx</code> and save to test HMR.
          </p>
        </div>
      </div>

      {/* Backend health indicator */}
      <div className="mt-6">
        <div className="badge badge-outline p-4">
          API health: {apiHealth ? apiHealth.status : "checking..."}
        </div>
      </div>
    </div>
  );
}

export default App;
