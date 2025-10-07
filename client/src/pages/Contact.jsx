export default function Contact() {
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold mb-4">Contact</h2>
      <form className="space-y-3">
        <input
          className="input input-bordered w-full"
          placeholder="Your name"
        />
        <input
          className="input input-bordered w-full"
          placeholder="Email"
          type="email"
        />
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Message"
          rows={5}
        />
        <button className="btn btn-primary">Send</button>
      </form>
    </div>
  );
}
