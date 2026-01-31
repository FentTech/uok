import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Phone, MessageCircle, Plus, X } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  type: "phone" | "whatsapp";
}

export default function SetupContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "whatsapp" as "phone" | "whatsapp",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Contact name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && contacts.length < 3) {
      const newContact: Contact = {
        id: Date.now().toString(),
        ...formData,
      };
      setContacts([...contacts, newContact]);
      setFormData({ name: "", phone: "", type: "whatsapp" });
      setErrors({});
    }
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleContinue = () => {
    // Save contacts and navigate to dashboard
    console.log("Contacts saved:", contacts);
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
                Add up to 3 trusted family or friends to be notified about your
                check-ins
              </p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Current Contacts */}
              {contacts.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Your Contacts ({contacts.length}/3)
                  </h2>
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg border border-cyan-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {contact.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              {contact.type === "whatsapp" ? (
                                <>
                                  <MessageCircle className="w-4 h-4" />
                                  <span>WhatsApp</span>
                                </>
                              ) : (
                                <>
                                  <Phone className="w-4 h-4" />
                                  <span>Phone</span>
                                </>
                              )}
                              <span>{contact.phone}</span>
                            </div>
                          </div>
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

                    {/* Contact Type */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Contact Method
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="phone">Phone Call</option>
                      </select>
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        {formData.type === "whatsapp"
                          ? "WhatsApp Number"
                          : "Phone Number"}
                      </label>
                      <div className="relative">
                        {formData.type === "whatsapp" ? (
                          <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        ) : (
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        )}
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Add Button */}
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Contact
                    </button>
                  </form>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Why emergency contacts?</span>
                  <br />
                  Your emergency contacts will be immediately notified when you
                  check in, and will receive an alert if you miss a check-in
                  time by more than 60 seconds.
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
                disabled={contacts.length === 0}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
