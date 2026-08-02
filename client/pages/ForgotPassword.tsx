import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Lock, Search } from "lucide-react";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const savedUser = localStorage.getItem("currentUser");
    const savedUsername = localStorage.getItem("username")?.toLowerCase();
    const savedPassword = localStorage.getItem("userPassword");
    const requested = username.trim().toLowerCase();
    const user = savedUser ? JSON.parse(savedUser) : null;

    if ((savedUsername === requested || user?.username === requested) && savedPassword) {
      setPassword(savedPassword);
      setMessage("Your saved password is shown below on this device.");
      return;
    }

    setPassword("");
    setMessage("We could not find that username on this device. Please use the device where you created the account or contact support.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Link to="/login" className="mb-6 flex items-center gap-2 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-cyan-700">UOK</span>
        </Link>
        <div className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Remember your password</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the username used on this device and UOK will show your saved password.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-900" htmlFor="username">Username</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4" required />
            </div>
            <button type="submit" className="w-full rounded-lg bg-cyan-600 py-2.5 font-semibold text-white hover:bg-cyan-700">Show password</button>
          </form>
          {message && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}
          {password && <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-center font-mono font-bold text-green-800">{password}</div>}
          <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-cyan-700 hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
