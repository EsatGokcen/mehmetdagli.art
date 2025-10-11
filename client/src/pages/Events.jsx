import { useEffect, useState, useCallback } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import EventItem from "../components/EventItem.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx"; // reuse for visual rhythm
import { fetchEvents } from "../lib/api";
import { useI18n } from "../i18n/index.jsx";

export default function Events() {
  const { t } = useI18n();
  const [events, setEvents] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  const load = useCallback(async () => {
    setState({ loading: true, error: "" });
    try {
      const data = await fetchEvents({ upcoming_only: true, limit: 50 });
      setEvents(Array.isArray(data) ? data : []);
      setState({ loading: false, error: "" });
    } catch (e) {
      setState({ loading: false, error: e.message || "Failed to load" });
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeader title={t("events.title")} />
      <ErrorAlert message={state.error} onRetry={load} />

      {state.loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : events.length ? (
        <div className="grid gap-4">
          {events.map((e) => (
            <EventItem key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <div className="opacity-70">{t("events.empty")}</div>
      )}
    </div>
  );
}
