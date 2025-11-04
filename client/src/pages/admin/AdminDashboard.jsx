import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import {
  API_BASE,
  refreshCsrf,
  fetchArtworks,
  fetchEvents,
  post,
  put,
  del,
  logout,
  AUTH_EXPIRED,
  uploadEventImages,
  deleteEventImage,
} from "../../lib/api.js";

const toAbsolute = (p) => (p?.startsWith("http") ? p : `${API_BASE}${p || ""}`);

/* --- UI helpers --- */
const cls = (...xs) => xs.filter(Boolean).join(" ");
const Surface = ({ className = "", children }) => (
  <div
    className={cls(
      "rounded-2xl bg-white border border-neutral-200/70",
      "shadow-[0_6px_20px_rgba(0,0,0,0.10)]",
      className
    )}
  >
    {children}
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();

  /** ----------------- Auto-logout: idle/absolute 60 min ----------------- */
  const timerRef = useRef(null);
  const MAX_SESSION_MS = 60 * 60 * 1000; // 1 hour

  useEffect(() => {
    let last = Number(localStorage.getItem("lastActivityAt")) || Date.now();

    const bumpActivity = () => {
      last = Date.now();
      try {
        localStorage.setItem("lastActivityAt", String(last));
      } catch {}
      schedule(); // re-arm with new remaining time
    };

    const expire = async () => {
      try {
        await logout();
      } catch {}
      navigate("/admin/login", {
        replace: true,
        state: { msg: "Oturum süresi doldu. Lütfen tekrar giriş yapın." },
      });
    };

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const remaining = MAX_SESSION_MS - (Date.now() - last);
      timerRef.current = setTimeout(expire, Math.max(1000, remaining));
    };

    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    events.forEach((ev) =>
      window.addEventListener(ev, bumpActivity, { passive: true })
    );
    schedule();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, bumpActivity));
    };
  }, [navigate]);

  /** ----------------- State ----------------- */
  /* Create forms */
  const [aForm, setAForm] = useState({
    title: "",
    price: "",
    medium: "",
    description: "",
    available: true,
    file: null,
  });
  const [aLoading, setALoading] = useState(false);
  const [aErr, setAErr] = useState("");

  const [eForm, setEForm] = useState({
    title: "",
    location: "",
    start_date: "",
    end_date: "",
    details: "",
    published: true,
    files: [], // NEW: multiple photos to upload after create
  });
  const [eLoading, setELoading] = useState(false);
  const [eErr, setEErr] = useState("");

  /* Lists */
  const [artworks, setArtworks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadErr, setLoadErr] = useState("");

  /* Editing modals */
  const [editArtwork, setEditArtwork] = useState(null);
  const [editEvent, setEditEvent] = useState(null);

  // For Edit Event modal: images with optional IDs (for delete)
  const [editEventImages, setEditEventImages] = useState([]); // [{id?, src}]
  const [imgBusy, setImgBusy] = useState(false);

  const closeEdits = () => {
    setEditArtwork(null);
    setEditEvent(null);
    setEditEventImages([]);
  };

  /** ----------------- Helpers ----------------- */
  const guardAuth = (err, fallbackMsg) => {
    if (err?.message === AUTH_EXPIRED) {
      navigate("/admin/login", { replace: true });
    } else {
      if (fallbackMsg) alert(err?.message || fallbackMsg);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
    } catch {}
    navigate("/admin/login", { replace: true });
  };

  /** ----------------- Data load ----------------- */
  const loadAll = useCallback(async () => {
    try {
      setLoadErr("");
      const [alist, elist] = await Promise.all([
        fetchArtworks({ offset: 0, limit: 200 }),
        fetchEvents({ offset: 0, limit: 200 }),
      ]);
      setArtworks(Array.isArray(alist) ? alist : []);
      setEvents(Array.isArray(elist) ? elist : []);
    } catch (e) {
      if (e?.message === AUTH_EXPIRED) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setLoadErr(e.message || "Veriler yüklenemedi.");
    }
  }, [navigate]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /** ----------------- Event images API (robust to different shapes) ----------------- */
  async function listEventImagesRaw(eventId) {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/images`, {
      credentials: "include",
    });
    if (res.status === 401) throw new Error(AUTH_EXPIRED);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function refreshEditEventImages(eventId) {
    try {
      setImgBusy(true);
      const data = await listEventImagesRaw(eventId);
      // Accept both shapes:
      // 1) [" /media/a.jpg", "/media/b.jpg" ]
      // 2) [ { id: 1, image_path: "/media/a.jpg" }, ... ]
      const normalized = Array.isArray(data)
        ? data.map((item) =>
            typeof item === "string"
              ? { id: null, src: item }
              : { id: item.id ?? null, src: item.image_path ?? "" }
          )
        : [];
      setEditEventImages(normalized);
    } catch (e) {
      guardAuth(e, "Görseller alınamadı.");
      setEditEventImages([]);
    } finally {
      setImgBusy(false);
    }
  }

  /** ----------------- Handlers ----------------- */
  function onAChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") setAForm((f) => ({ ...f, [name]: checked }));
    else if (type === "file")
      setAForm((f) => ({ ...f, file: files?.[0] || null }));
    else setAForm((f) => ({ ...f, [name]: value }));
  }

  function onEChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") setEForm((f) => ({ ...f, [name]: checked }));
    else if (type === "file") {
      const list = files ? Array.from(files) : [];
      setEForm((f) => ({ ...f, files: list }));
    } else setEForm((f) => ({ ...f, [name]: value }));
  }

  async function createArtwork(ev) {
    ev.preventDefault();
    setAErr("");
    if (!aForm.title.trim()) {
      setAErr("Lütfen eser başlığını girin.");
      return;
    }
    try {
      setALoading(true);
      const payload = {
        title: aForm.title.trim(),
        price: aForm.price ? Number(aForm.price) : null,
        medium: aForm.medium.trim() || null,
        description: aForm.description.trim() || null,
        available: !!aForm.available,
      };
      const created = await post("/api/portfolio", payload);

      // optional image upload
      if (created?.id && aForm.file) {
        const csrf = await refreshCsrf();
        const fd = new FormData();
        fd.append("file", aForm.file);
        const res = await fetch(
          `${API_BASE}/api/portfolio/${created.id}/image`,
          {
            method: "POST",
            credentials: "include",
            headers: { "x-csrf-token": csrf },
            body: fd,
          }
        );
        if (res.status === 401) {
          // treat as expired
          navigate("/admin/login", { replace: true });
          return;
        }
        if (!res.ok)
          throw new Error((await res.text()) || "Görsel yüklenemedi.");
      }

      setAForm({
        title: "",
        price: "",
        medium: "",
        description: "",
        available: true,
        file: null,
      });
      loadAll();
    } catch (err) {
      if (err?.message === AUTH_EXPIRED) {
        navigate("/admin/login", { replace: true });
      } else {
        setAErr(err.message || "Eser oluşturulamadı.");
      }
    } finally {
      setALoading(false);
    }
  }

  async function createEvent(ev) {
    ev.preventDefault();
    setEErr("");
    if (!eForm.title.trim()) {
      setEErr("Lütfen etkinlik başlığını girin.");
      return;
    }
    try {
      setELoading(true);
      const payload = {
        title: eForm.title.trim(),
        location: eForm.location.trim() || null,
        start_date: eForm.start_date || null,
        end_date: eForm.end_date || null,
        details: eForm.details.trim() || null,
        published: !!eForm.published,
      };
      const created = await post("/api/events", payload);

      // Upload selected images (multi) after event creation
      if (created?.id && Array.isArray(eForm.files) && eForm.files.length) {
        await uploadEventImages(created.id, eForm.files);
      }

      setEForm({
        title: "",
        location: "",
        start_date: "",
        end_date: "",
        details: "",
        published: true,
        files: [],
      });
      loadAll();
    } catch (err) {
      if (err?.message === AUTH_EXPIRED) {
        navigate("/admin/login", { replace: true });
      } else {
        setEErr(err.message || "Etkinlik oluşturulamadı.");
      }
    } finally {
      setELoading(false);
    }
  }

  async function removeArtwork(id) {
    if (!confirm("Bu eseri silmek istediğinize emin misiniz?")) return;
    try {
      await del(`/api/portfolio/${id}`);
      loadAll();
    } catch (e) {
      guardAuth(e, "Silme işlemi başarısız.");
    }
  }

  async function removeEvent(id) {
    if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
    try {
      await del(`/api/events/${id}`);
      loadAll();
    } catch (e) {
      guardAuth(e, "Silme işlemi başarısız.");
    }
  }

  async function saveEditedArtwork() {
    try {
      const payload = {
        title: editArtwork.title ?? "",
        description: editArtwork.description ?? null,
        medium: editArtwork.medium ?? null,
        price:
          editArtwork.price === "" || editArtwork.price == null
            ? null
            : Number(editArtwork.price),
        available: !!editArtwork.available,
      };
      await put(`/api/portfolio/${editArtwork.id}`, payload);
      closeEdits();
      loadAll();
    } catch (e) {
      guardAuth(e, "Güncelleme başarısız.");
    }
  }

  async function saveEditedEvent() {
    try {
      const payload = {
        title: editEvent.title ?? "",
        location: editEvent.location ?? null,
        start_date: editEvent.start_date ?? null,
        end_date: editEvent.end_date ?? null,
        details: editEvent.details ?? null,
        published: !!editEvent.published,
      };
      await put(`/api/events/${editEvent.id}`, payload);
      closeEdits();
      loadAll();
    } catch (e) {
      guardAuth(e, "Güncelleme başarısız.");
    }
  }

  async function uploadArtworkImage(artworkId, file) {
    if (!file) return;
    const csrf = await refreshCsrf();
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/api/portfolio/${artworkId}/image`, {
      method: "POST",
      credentials: "include",
      headers: { "x-csrf-token": csrf },
      body: fd,
    });
    if (res.status === 401) {
      navigate("/admin/login", { replace: true });
      return;
    }
    if (!res.ok) throw new Error((await res.text()) || "Görsel yüklenemedi.");
  }

  async function deleteArtworkImage(artworkId) {
    const csrf = await refreshCsrf();
    const res = await fetch(`${API_BASE}/api/portfolio/${artworkId}/image`, {
      method: "DELETE",
      credentials: "include",
      headers: { "x-csrf-token": csrf },
    });
    if (res.status === 401) {
      navigate("/admin/login", { replace: true });
      return;
    }
    if (!res.ok) throw new Error((await res.text()) || "Görsel silinemedi.");
  }

  /** ----------------- UI ----------------- */
  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900">
          Yönetim Paneli
        </h1>
        <button className="btn rounded-full" onClick={handleLogoutClick}>
          Çıkış
        </button>
      </div>

      <ErrorAlert message={loadErr} />

      {/* Create forms */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* --------- ESER EKLE --------- */}
        <Surface className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-neutral-900">Eser Ekle</h2>
          <div className="h-px w-full bg-neutral-200/80 my-3" />
          <form
            className="flex flex-col gap-4 min-h-[320px]"
            onSubmit={createArtwork}
          >
            <input
              name="title"
              value={aForm.title}
              onChange={onAChange}
              className="input input-bordered w-full"
              type="text"
              placeholder="Başlık"
            />

            <div className="grid grid-cols-1 gap-3">
              <input
                name="price"
                value={aForm.price}
                onChange={onAChange}
                className="input input-bordered w-full"
                type="number"
                placeholder="Fiyat"
              />
              <input
                name="medium"
                value={aForm.medium}
                onChange={onAChange}
                className="input input-bordered w-full"
                type="text"
                placeholder="Teknik / Malzeme"
              />
            </div>

            {/* File input BEFORE description (aligns with Event's date row) */}
            <input
              type="file"
              accept="image/*"
              onChange={onAChange}
              name="file"
              className="file-input file-input-bordered w-full"
            />

            <textarea
              name="description"
              value={aForm.description}
              onChange={onAChange}
              className="textarea textarea-bordered w-full min-h-[100px]"
              placeholder="Açıklama / Detay"
            />

            {/* Bottom row: Satışta (left) + Oluştur (right) */}
            <div className="mt-auto flex items-center justify-between gap-4">
              <label className="label cursor-pointer justify-start gap-3 m-0">
                <input
                  type="checkbox"
                  className="checkbox"
                  name="available"
                  checked={aForm.available}
                  onChange={onAChange}
                />
                <span className="label-text">Satışta</span>
              </label>

              <button
                className={cls(
                  "btn rounded-full bg-neutral-900 text-white hover:bg-black",
                  aLoading && "btn-disabled opacity-70"
                )}
                disabled={aLoading}
                type="submit"
              >
                {aLoading ? "Kaydediliyor…" : "Oluştur"}
              </button>
            </div>

            <ErrorAlert message={aErr} />
          </form>
        </Surface>

        {/* --------- ETKİNLİK EKLE --------- */}
        <Surface className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-neutral-900">
            Etkinlik Ekle
          </h2>
          <div className="h-px w-full bg-neutral-200/80 my-3" />
          <form
            className="flex flex-col gap-4 min-h-[320px]"
            onSubmit={createEvent}
          >
            <input
              name="title"
              value={eForm.title}
              onChange={onEChange}
              className="input input-bordered w-full"
              type="text"
              placeholder="Başlık"
            />
            <input
              name="location"
              value={eForm.location}
              onChange={onEChange}
              className="input input-bordered w-full"
              type="text"
              placeholder="Mekan"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="start_date"
                value={eForm.start_date}
                onChange={onEChange}
                className="input input-bordered w-full"
                type="date"
                placeholder="Başlangıç"
              />
              <input
                name="end_date"
                value={eForm.end_date}
                onChange={onEChange}
                className="input input-bordered w-full"
                type="date"
                placeholder="Bitiş"
              />
            </div>

            {/* Choose files (multi) just like the Artwork form */}
            <input
              type="file"
              accept="image/*"
              multiple
              name="files"
              className="file-input file-input-bordered w-full"
              onChange={onEChange}
            />

            <textarea
              name="details"
              value={eForm.details}
              onChange={onEChange}
              className="textarea textarea-bordered w-full min-h-[100px]"
              placeholder="Açıklama / Detay"
            />

            {/* Bottom row: Yayınla (left) + Oluştur (right) */}
            <div className="mt-auto flex items-center justify-between gap-4 flex-wrap">
              <label className="label cursor-pointer justify-start gap-3 m-0">
                <input
                  type="checkbox"
                  className="checkbox"
                  name="published"
                  checked={eForm.published}
                  onChange={onEChange}
                />
                <span className="label-text">Yayınla</span>
              </label>

              <button
                className={cls(
                  "btn rounded-full bg-neutral-900 text-white hover:bg-black",
                  eLoading && "btn-disabled opacity-70"
                )}
                disabled={eLoading}
                type="submit"
              >
                {eLoading ? "Kaydediliyor…" : "Oluştur"}
              </button>
            </div>

            <ErrorAlert message={eErr} />
          </form>
        </Surface>
      </div>

      {/* Lists */}
      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        {/* --------- ESERLER --------- */}

        <Surface className="p-6 md:p-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Eserler
          </h3>
          {artworks.length ? (
            <div className="overflow-x-auto">
              <div className="max-h-[520px] overflow-y-auto pr-1">
                <table className="table w-full">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr>
                      <th>Başlık</th>
                      <th>Fiyat</th>
                      <th>Durum</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artworks.map((a) => {
                      const imgSrc = a.image_path
                        ? a.image_path.startsWith("/media")
                          ? `${API_BASE}${a.image_path}`
                          : `${API_BASE}/media/${a.image_path}`
                        : null;
                      return (
                        <tr key={a.id} className="hover">
                          {/* Title */}
                          <td className="align-middle whitespace-normal break-words max-w-[220px]">
                            {a.title}
                          </td>

                          {/* Price */}
                          <td className="align-middle">{a.price ?? "—"}</td>

                          {/* Availability */}
                          <td className="align-middle">
                            {a.available ? "Satışta" : "Satışta değil"}
                          </td>

                          {/* Actions */}
                          <td className="align-middle text-right whitespace-nowrap">
                            <button
                              className="btn btn-sm me-2"
                              onClick={() => setEditArtwork(a)}
                            >
                              Düzenle
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => removeArtwork(a.id)}
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="opacity-60">Henüz eser yok.</div>
          )}
        </Surface>

        {/* --------- ETKİNLİKLER --------- */}
        <Surface className="p-6 md:p-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Etkinlikler
          </h3>
          {events.length ? (
            <div className="overflow-x-auto">
              <div className="max-h-[520px] overflow-y-auto pr-1">
                <table className="table table-auto w-full">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr>
                      <th>Başlık</th>
                      <th>Mekan</th>
                      <th>Tarih</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id} className="hover">
                        {/* Başlık – modest width; allow wrap */}
                        <td className="align-middle whitespace-normal break-words max-w-[180px]">
                          {ev.title}
                        </td>

                        {/* Mekan – a bit narrower so Tarih can breathe */}
                        <td className="align-middle whitespace-normal break-words max-w-[200px]">
                          {ev.location ?? "—"}
                        </td>

                        {/* Tarih – wider + no wrap per date line */}
                        <td className="align-middle max-w-[240px]">
                          <div className="flex flex-col">
                            <span className="whitespace-nowrap">
                              {ev.start_date ?? "—"}
                            </span>
                            {ev.end_date ? (
                              <span className="whitespace-nowrap">
                                {ev.end_date}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* İşlem – fixed compact width, no wrap */}
                        <td className="align-middle text-right whitespace-nowrap w-[164px]">
                          <button
                            className="btn btn-sm me-2"
                            onClick={async () => {
                              setEditEvent(ev);
                            }}
                          >
                            Düzenle
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => removeEvent(ev.id)}
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="opacity-60">Henüz etkinlik yok.</div>
          )}
        </Surface>
      </div>

      {/* ---- Artwork Edit Modal ---- */}
      {editArtwork && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-semibold text-lg mb-3">Eser Düzenle</h3>

            {/* Helper to refresh this single artwork in the modal */}
            {(() => {
              const refreshOneArtwork = async () => {
                const list = await fetchArtworks({ offset: 0, limit: 200 });
                const safe = Array.isArray(list) ? list : [];
                setArtworks(safe);
                const updated = safe.find((x) => x.id === editArtwork.id);
                if (updated) setEditArtwork(updated);
              };

              const currentImg = editArtwork?.image_path
                ? editArtwork.image_path.startsWith("/media")
                  ? `${API_BASE}${editArtwork.image_path}`
                  : `${API_BASE}/media/${editArtwork.image_path}`
                : null;

              return (
                <>
                  <div className="grid gap-3">
                    <input
                      className="input input-bordered"
                      value={editArtwork.title || ""}
                      onChange={(e) =>
                        setEditArtwork({
                          ...editArtwork,
                          title: e.target.value,
                        })
                      }
                      placeholder="Başlık"
                    />
                    <div className="grid md:grid-cols-3 gap-3">
                      <input
                        className="input input-bordered"
                        value={editArtwork.medium || ""}
                        onChange={(e) =>
                          setEditArtwork({
                            ...editArtwork,
                            medium: e.target.value,
                          })
                        }
                        placeholder="Teknik"
                      />
                      <input
                        className="input input-bordered"
                        type="number"
                        value={editArtwork.price ?? ""}
                        onChange={(e) =>
                          setEditArtwork({
                            ...editArtwork,
                            price: e.target.value,
                          })
                        }
                        placeholder="Fiyat"
                      />
                      <label className="label cursor-pointer justify-start gap-3">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={!!editArtwork.available}
                          onChange={(e) =>
                            setEditArtwork({
                              ...editArtwork,
                              available: e.target.checked,
                            })
                          }
                        />
                        <span className="label-text">Satışta</span>
                      </label>
                    </div>
                    <textarea
                      className="textarea textarea-bordered"
                      value={editArtwork.description || ""}
                      onChange={(e) =>
                        setEditArtwork({
                          ...editArtwork,
                          description: e.target.value,
                        })
                      }
                      placeholder="Açıklama"
                    />

                    {/* Current image preview + delete */}
                    <div className="mt-2">
                      <label className="block font-medium mb-2">Görsel</label>
                      {currentImg ? (
                        <div className="relative inline-block">
                          <img
                            src={currentImg}
                            alt={editArtwork.title || "artwork"}
                            className="h-28 w-auto rounded-lg object-cover border border-neutral-200"
                          />
                          <button
                            type="button"
                            className="btn btn-xs absolute top-1 right-1"
                            onClick={async () => {
                              if (
                                !confirm(
                                  "Bu görseli silmek istediğinize emin misiniz?"
                                )
                              )
                                return;
                              try {
                                await deleteArtworkImage(editArtwork.id);
                                await refreshOneArtwork();
                              } catch (err) {
                                guardAuth(err, "Görsel silinemedi.");
                              }
                            }}
                          >
                            Sil
                          </button>
                        </div>
                      ) : (
                        <div className="opacity-60 text-sm">Görsel yok.</div>
                      )}
                    </div>

                    {/* Upload new image */}
                    <div className="mt-3 grid md:grid-cols-[1fr_auto_auto] items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        className="file-input file-input-bordered w-full"
                        onChange={(e) =>
                          setEditArtwork({
                            ...editArtwork,
                            _newFile: e.target.files?.[0] || null,
                          })
                        }
                      />
                      <button
                        type="button"
                        className="btn"
                        onClick={async () => {
                          try {
                            await uploadArtworkImage(
                              editArtwork.id,
                              editArtwork._newFile
                            );
                            setEditArtwork({ ...editArtwork, _newFile: null });
                            await refreshOneArtwork();
                          } catch (err) {
                            guardAuth(err, "Görsel yüklenemedi.");
                          }
                        }}
                        disabled={!editArtwork._newFile}
                      >
                        Görseli Yükle
                      </button>
                    </div>
                  </div>

                  <div className="modal-action">
                    <button className="btn" onClick={closeEdits}>
                      Kapat
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={saveEditedArtwork}
                    >
                      Kaydet
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ---- Event Edit Modal ---- */}
      {editEvent && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-semibold text-lg mb-3">Etkinlik Düzenle</h3>

            {/* Load images when the modal opens */}
            <ModalImagesLoader
              eventId={editEvent.id}
              onLoad={(items) => setEditEventImages(items)}
              loader={refreshEditEventImages}
            />

            <div className="grid gap-3">
              <input
                className="input input-bordered"
                value={editEvent.title || ""}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, title: e.target.value })
                }
                placeholder="Başlık"
              />
              <input
                className="input input-bordered"
                value={editEvent.location || ""}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, location: e.target.value })
                }
                placeholder="Mekan"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input input-bordered"
                  type="date"
                  value={editEvent.start_date || ""}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, start_date: e.target.value })
                  }
                />
                <input
                  className="input input-bordered"
                  type="date"
                  value={editEvent.end_date || ""}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, end_date: e.target.value })
                  }
                />
              </div>
              <textarea
                className="textarea textarea-bordered"
                value={editEvent.details || ""}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, details: e.target.value })
                }
                placeholder="Detay"
              />
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={!!editEvent.published}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, published: e.target.checked })
                  }
                />
                <span className="label-text">Yayınla</span>
              </label>

              {/* --- Existing images with delete buttons --- */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Görseller</h4>
                  {imgBusy && (
                    <span className="text-xs opacity-60">Yükleniyor…</span>
                  )}
                </div>
                {editEventImages.length ? (
                  <div className="flex gap-2 overflow-x-auto p-1">
                    {editEventImages.map((im, idx) => (
                      <div
                        key={(im.id ?? "noid") + "-" + idx}
                        className="relative flex-shrink-0"
                      >
                        <img
                          src={toAbsolute(im.src)}
                          alt="exhibition image"
                          className="h-24 w-auto rounded object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        {im.id != null ? (
                          <button
                            type="button"
                            className="btn btn-xs absolute top-1 right-1"
                            onClick={async () => {
                              if (
                                !confirm(
                                  "Bu görseli silmek istediğinize emin misiniz?"
                                )
                              )
                                return;
                              try {
                                setImgBusy(true);
                                await deleteEventImage(editEvent.id, im.id);
                                await refreshEditEventImages(editEvent.id);
                                await loadAll();
                              } catch (err) {
                                guardAuth(err, "Görsel silinemedi.");
                              } finally {
                                setImgBusy(false);
                              }
                            }}
                          >
                            Sil
                          </button>
                        ) : (
                          <span className="absolute top-1 right-1 text-[10px] bg-white/80 rounded px-1">
                            (id yok)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="opacity-60 text-sm">
                    Bu etkinlikte görsel yok.
                  </div>
                )}
              </div>

              {/* --- Add more images (multi-upload) --- */}
              <div className="mt-2 grid md:grid-cols-[1fr_auto] items-center gap-3">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={async (e) => {
                    const files = e.target.files
                      ? Array.from(e.target.files)
                      : [];
                    if (!files.length) return;
                    try {
                      setImgBusy(true);
                      await uploadEventImages(editEvent.id, files);
                      await refreshEditEventImages(editEvent.id);
                      await loadAll();
                    } catch (err) {
                      guardAuth(err, "Görseller yüklenemedi.");
                    } finally {
                      setImgBusy(false);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn"
                  onClick={() => refreshEditEventImages(editEvent.id)}
                >
                  Görselleri Yenile
                </button>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={closeEdits}>
                Kapat
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  await saveEditedEvent();
                  // Ensure images list on main table also reflects changes
                  await loadAll();
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Utility subcomponent: loads images when modal opens */
function ModalImagesLoader({ eventId, onLoad, loader }) {
  useEffect(() => {
    if (!eventId) return;
    (async () => {
      const items = await loader(eventId);
      if (Array.isArray(items)) onLoad(items);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);
  return null;
}
