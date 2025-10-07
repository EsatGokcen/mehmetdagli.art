export default function AdminLogin() {
  return (
    <div className="max-w-sm mx-auto card bg-base-100 shadow p-6">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      <input
        className="input input-bordered w-full mb-3"
        placeholder="Password"
        type="password"
      />
      <button className="btn btn-primary w-full">Login</button>
    </div>
  );
}
