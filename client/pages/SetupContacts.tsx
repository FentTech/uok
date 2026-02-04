import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Plus, X, Copy, Check } from "lucide-react";

interface BondedContact {
  id: string;
  name: string;
  email: string;
  bondCode: string;
  status: "pending" | "bonded";
  bondedAt?: string;
}

export default function SetupContacts() {
  const [contacts, setContacts] = useState<BondedContact[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Contact name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const generateBondCode = () => {
    return `BOND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && contacts.length < 3) {
      const newContact: BondedContact = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        bondCode: generateBondCode(),
        status: "pending",
      };
      setContacts([...contacts, newContact]);
      setFormData({ name: "", email: "" });
      setErrors({});
    }
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleCopyBondCode = (bondCode: string, id: string) => {
    navigator.clipboard.writeText(bondCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleContinue = () => {
    // Save contacts and navigate to dashboard
    const bondedContacts = contacts.map((c) => ({
      ...c,
      status: "pending" as const,
    }));
    localStorage.setItem("bondedContacts", JSON.stringify(bondedContacts));
    console.log("Bond codes generated:", bondedContacts);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-50">
      {/* Header */}
      <div className="border-b border-cyan-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              UOK
            </span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-cyan-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-12 text-white">
              <h1 className="text-3xl font-bold mb-2">Emergency Contacts</h1>
              <p className="text-cyan-50">
                Generate bond codes to connect with trusted family and friends.
                They can use these codes to bond with you in the app.
              </p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Current Contacts */}
              {contacts.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Your Bond Codes ({contacts.length}/3)
                  </h2>
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg border border-cyan-200"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {contact.name}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="px-3 py-1 bg-white rounded border border-cyan-300 text-sm font-mono text-cyan-700">
                              {contact.bondCode}
                            </code>
                            <button
                              onClick={() =>
                                handleCopyBondCode(contact.bondCode, contact.id)
                              }
                              className="p-2 hover:bg-cyan-100 rounded transition text-cyan-600"
                              title="Copy bond code"
                            >
                              {copiedId === contact.id ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Share this code with {contact.name} to bond
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveContact(contact.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition text-red-500 hover:text-red-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Contact Form */}
              {contacts.length < 3 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    {contacts.length === 0
                      ? "Add Your First Contact"
                      : "Add Another Contact"}
                  </h2>
                  <form onSubmit={handleAddContact} className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Mom, Brother, Best Friend"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g., mom@example.com"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Add Button */}
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Generate Bond Code
                    </button>
                  </form>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">How it works:</span>
                  <br />
                  1. Generate a bond code for each contact
                  <br />
                  2. Share the code with them (copy & paste, text, email)
                  <br />
                  3. They enter the code in their UOK app to bond with you
                  <br />
                  4. Once bonded, you'll see their check-in status and alerts
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-slate-400 transition"
              >
                Skip for Now
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-200 transition"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
