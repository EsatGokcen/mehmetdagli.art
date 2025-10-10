import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import SectionHeader from "../components/SectionHeader.jsx";
import EventItem from "../components/EventItem.jsx";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/events?upcoming_only=true&limit=50`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        if (mounted) {
          setEvents(data);
          setState({ loading: false, error: "" });
        }
      } catch (e) {
        if (mounted)
          setState({ loading: false, error: String(e.message || e) });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container">
      <SectionHeader
        title="Upcoming Events"
        subtitle="Exhibitions, openings, and shows"
      />
      {state.loading && (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card bg-base-200 animate-pulse">
              <div className="card-body">
                <div className="h-4 bg-base-300 rounded w-1/3 mb-2" />
                <div className="h-3 bg-base-300 rounded w-1/2 mb-2" />
                <div className="h-3 bg-base-300 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}
      {!state.loading && state.error && (
        <div className="alert alert-error">{state.error}</div>
      )}
      {!state.loading &&
        !state.error &&
        (events.length ? (
          <div className="grid gap-4">
            {events.map((e) => (
              <EventItem key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div className="opacity-70">No upcoming events.</div>
        ))}
    </div>
  );
}
