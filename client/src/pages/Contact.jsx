import { useState } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import { useI18n } from "../i18n/index.jsx";
import { getContactStrings } from "../i18n/contact.js";

/* --- small helpers & monochrome primitives --- */
const cls = (...xs) => xs.filter(Boolean).join(" ");

const Surface = ({ className = "", children }) => (
  <div
    className={cls(
      "rounded-2xl bg-white border border-neutral-200/70",
      "shadow-[0_6px_20px_rgba(0,0,0,0.10)]",
      "hover:shadow-[0_18px_48px_rgba(0,0,0,0.22)] transition-shadow",
      className
    )}
  >
    {children}
  </div>
);

const FieldError = ({ children }) =>
  children ? <p className="text-xs text-red-600 mt-1">{children}</p> : null;

export default function Contact() {
  const { lang } = useI18n();
  const S = getContactStrings(lang);

  const [form, setForm] = useState({
    name: "",
    email: "",
    howFound: "",
    message: "",
    purchaseInquiry: false,
    address: "",
  });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const portrait = "/mehmet2.png"; // circular avatar (from /public)

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = S.helpers.required;
    if (!form.email.trim()) errs.email = S.helpers.required;
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = S.helpers.emailBad;
    if (!form.message.trim()) errs.message = S.helpers.required;
    if (form.purchaseInquiry && !form.address.trim()) {
      errs.address = S.helpers.required;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    console.log("Contact form payload:", form); // replace with SMTP later
    setSent(true);
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* top header + larger circular image */}
      <div className="flex flex-col items-center text-center">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border border-neutral-200 shadow-[0_8px_28px_rgba(0,0,0,0.20)]">
          <img
            src={portrait}
            alt={S.name}
            className="w-full h-full object-cover object-[90%_35%]"
            loading="eager"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
        <h1 className="mt-5 text-3xl md:text-4xl font-semibold text-neutral-900">
          {S.name}
        </h1>
        <p className="mt-3 text-neutral-700 max-w-2xl">{S.intro}</p>
      </div>

      {/* wider form card */}
      <div className="mt-10 mx-auto max-w-3xl">
        <Surface className="p-6 md:p-8">
          <SectionHeader title={S.title} />
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            {/* Name */}
            <div>
              <label className="label block mb-2">
                <span className="label-text text-neutral-800">
                  {S.fields.yourName}
                </span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                className="input input-bordered w-full text-neutral-900 placeholder-neutral-500"
                autoComplete="name"
              />
              <FieldError>{errors.name}</FieldError>
            </div>

            {/* Email */}
            <div>
              <label className="label block mb-2">
                <span className="label-text text-neutral-800">
                  {S.fields.email}
                </span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="input input-bordered w-full text-neutral-900 placeholder-neutral-500"
                autoComplete="email"
              />
              <FieldError>{errors.email}</FieldError>
            </div>

            {/* Message */}
            <div>
              <label className="label block mb-2">
                <span className="label-text text-neutral-800">
                  {S.fields.message}
                </span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                className="textarea textarea-bordered w-full min-h-[140px] text-neutral-900 placeholder-neutral-500"
              />
              <FieldError>{errors.message}</FieldError>
            </div>

            {/* How did you find us? (forced to open below) */}
            <div>
              <label className="label block mb-2">
                <span className="label-text text-neutral-800">
                  {S.fields.howFound}
                </span>
              </label>

              <div className="dropdown dropdown-bottom w-full">
                <button
                  type="button"
                  tabIndex={0}
                  className="btn w-full justify-between bg-white border border-neutral-300 text-neutral-900"
                >
                  {form.howFound || "—"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <ul
                  tabIndex={0}
                  className="dropdown-content z-[50] menu p-2 mt-1 w-full rounded-box bg-base-100 border border-neutral-200 shadow-[0_12px_32px_rgba(0,0,0,0.24)]"
                >
                  {S.findOptions.map((opt, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="justify-between"
                        onClick={() =>
                          setForm((f) => ({ ...f, howFound: opt }))
                        }
                      >
                        {opt}
                        {form.howFound === opt ? (
                          <span className="text-xs opacity-60">✓</span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Purchase checkbox */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox"
                  name="purchaseInquiry"
                  checked={form.purchaseInquiry}
                  onChange={onChange}
                />
                <span className="label-text text-neutral-800">
                  {S.fields.purchaseQ}
                </span>
              </label>
            </div>

            {/* Address (conditional) */}
            {form.purchaseInquiry && (
              <div>
                <label className="label block mb-2">
                  <span className="label-text text-neutral-800">
                    {S.fields.address}
                  </span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  className="textarea textarea-bordered w-full min-h-[100px] text-neutral-900 placeholder-neutral-500"
                />
                <FieldError>{errors.address}</FieldError>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="btn rounded-full bg-neutral-900 text-white hover:bg-black"
              >
                {S.fields.submit}
              </button>
            </div>

            {/* Success note (placeholder until SMTP) */}
            {sent && (
              <div role="alert" className="alert alert-success mt-2">
                <span>{S.helpers.sent}</span>
              </div>
            )}
          </form>
        </Surface>
      </div>
    </div>
  );
}
