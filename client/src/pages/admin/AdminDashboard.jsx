import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../../lib/api";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState([]);
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState("");

  // forms
  const [aForm, setAForm] = useState({
    title: "",
    price: "",
    available: true,
    medium: "",
    description: "",
  });
  const [aImage, setAImage] = useState(null);
  const [eForm, setEForm] = useState({
    title: "",
    location: "",
    start_date: "",
    end_date: "",
    details: "",
    is_published: true,
  });

  function onAChange(e) {
    const { name, type, value, checked } = e.target;
    setAForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }
  function onEChange(e) {
    const { name, type, value, checked } = e.target;
    setEForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  async function load() {
    const list = await api.get("/api/portfolio?offset=0&limit=100");
    setArtworks(list);
    const ev = await api.get("/api/events?limit=100");
    setEvents(ev);
  }

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get("/api/auth/me");
        if (!me?.is_admin) {
          nav("/admin/login", { replace: true, state: { from: "/admin" } });
          return;
        }
        await api.refreshCsrf();
        await load();
      } catch {
        nav("/admin/login", { replace: true, state: { from: "/admin" } });
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  async function createArtwork(e) {
    e.preventDefault();
    setMsg("");
    try {
      const body = {
        title: aForm.title,
        price: aForm.price ? Number(aForm.price) : null,
        available: !!aForm.available,
        medium: aForm.medium || null,
        description: aForm.description || null,
      };
      const created = await api.post("/api/portfolio", body);
      if (aImage) {
        await api.uploadArtworkImage(created.id, aImage);
      }
      setAForm({
        title: "",
        price: "",
        available: true,
        medium: "",
        description: "",
      });
      setAImage(null);
      setMsg("Artwork created.");
      await load();
    } catch (err) {
      setMsg(String(err.message || err));
    }
  }

  async function deleteArtwork(id) {
    if (!confirm("Delete this artwork?")) return;
    await api.del(`/api/portfolio/${id}`);
    await load();
  }

  async function createEvent(e) {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/api/events", eForm);
      setEForm({
        title: "",
        location: "",
        start_date: "",
        end_date: "",
        details: "",
        is_published: true,
      });
      setMsg("Event created.");
      await load();
    } catch (err) {
      setMsg(String(err.message || err));
    }
  }

  async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    await api.del(`/api/events/${id}`);
    await load();
  }

  async function doLogout() {
    try {
      await api.logout();
    } finally {
      nav("/admin/login", { replace: true });
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button className="btn" onClick={doLogout}>
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Add Artwork</h2>
          <form onSubmit={createArtwork} className="space-y-3">
            <input
              className="input input-bordered w-full"
              name="title"
              placeholder="Title"
              value={aForm.title}
              onChange={onAChange}
              required
            />
            <input
              className="input input-bordered w-full"
              name="price"
              placeholder="Price"
              value={aForm.price}
              onChange={onAChange}
            />
            <input
              className="input input-bordered w-full"
              name="medium"
              placeholder="Medium"
              value={aForm.medium}
              onChange={onAChange}
            />
            <textarea
              className="textarea textarea-bordered w-full"
              name="description"
              placeholder="Description"
              value={aForm.description}
              onChange={onAChange}
            />
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox"
                name="available"
                checked={aForm.available}
                onChange={onAChange}
              />
              <span className="label-text">Available</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              onChange={(e) => setAImage(e.target.files?.[0] ?? null)}
            />
            <button className="btn btn-primary">Create</button>
          </form>

          <h3 className="text-lg font-semibold mt-8 mb-2">Artworks</h3>
          <div className="space-y-3">
            {artworks.map((a) => (
              <div key={a.id} className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{a.title}</div>
                    <div className="opacity-60 text-sm">#{a.id}</div>
                  </div>
                  <div className="text-sm opacity-70">{a.medium || "—"}</div>
                  <div className="flex items-center gap-3">
                    <span>{a.price != null ? `£${a.price}` : "—"}</span>
                    <span
                      className={`badge ${a.available ? "badge-success" : ""}`}
                    >
                      {a.available ? "Available" : "Not available"}
                    </span>
                  </div>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-outline btn-error"
                      onClick={() => deleteArtwork(a.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {artworks.length === 0 && (
              <div className="opacity-70 text-sm">No artworks yet.</div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Add Event</h2>
          <form onSubmit={createEvent} className="space-y-3">
            <input
              className="input input-bordered w-full"
              name="title"
              placeholder="Title"
              value={eForm.title}
              onChange={onEChange}
              required
            />
            <input
              className="input input-bordered w-full"
              name="location"
              placeholder="Location"
              value={eForm.location}
              onChange={onEChange}
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Start date</span>
                </div>
                <input
                  type="date"
                  className="input input-bordered"
                  name="start_date"
                  value={eForm.start_date}
                  onChange={onEChange}
                  required
                />
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">End date</span>
                </div>
                <input
                  type="date"
                  className="input input-bordered"
                  name="end_date"
                  value={eForm.end_date}
                  onChange={onEChange}
                />
              </label>
            </div>
            <textarea
              className="textarea textarea-bordered w-full"
              name="details"
              placeholder="Details"
              value={eForm.details}
              onChange={onEChange}
            />
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox"
                name="is_published"
                checked={eForm.is_published}
                onChange={onEChange}
              />
              <span className="label-text">Published</span>
            </label>
            <button className="btn btn-primary">Create</button>
          </form>

          <h3 className="text-lg font-semibold mt-8 mb-2">Events</h3>
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{ev.title}</div>
                    <div className="opacity-60 text-sm">#{ev.id}</div>
                  </div>
                  <div className="text-sm opacity-70">{ev.location || "—"}</div>
                  <div className="text-sm">
                    {ev.start_date}
                    {ev.end_date ? ` → ${ev.end_date}` : ""}
                  </div>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-outline btn-error"
                      onClick={() => deleteEvent(ev.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="opacity-70 text-sm">No events yet.</div>
            )}
          </div>
        </section>
      </div>

      {msg && (
        <div className="toast toast-end">
          <div className="alert alert-info">{msg}</div>
        </div>
      )}
    </div>
  );
}
