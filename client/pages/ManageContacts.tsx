import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Phone, MessageCircle, Plus, X, Edit2 } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  type: "phone" | "whatsapp";
}

export default function ManageContacts() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Mom",
      phone: "+1 (555) 123-4567",
      type: "whatsapp",
    },
    {
      id: "2",
      name: "Brother",
      phone: "+1 (555) 234-5678",
      type: "phone",
    },
    {
      id: "3",
      name: "Best Friend",
      phone: "+1 (555) 345-6789",
      type: "whatsapp",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "whatsapp" as "phone" | "whatsapp",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (editingId) {
        setContacts(
          contacts.map((c) =>
            c.id === editingId ? { ...c, ...formData } : c
          )
        );
        setEditingId(null);
      } else {
        if (contacts.length >= 3) {
          alert("Maximum 3 emergency contacts allowed");
          return;
        }
        const newContact: Contact = {
          id: Date.now().toString(),
          ...formData,
        };
        setContacts([...contacts, newContact]);
      }
      setFormData({ name: "", phone: "", type: "whatsapp" });
      setErrors({});
    }
  };

  const handleEditContact = (contact: Contact) => {
    setFormData({ name: contact.name, phone: contact.phone, type: contact.type });
    setEditingId(contact.id);
  };

  const handleDeleteContact = (id: string) => {
    if (contacts.length <= 1) {
      alert("You must have at least 1 emergency contact");
      return;
    }
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "", type: "whatsapp" });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-50">
      {/* Header */}
      <div className="border-b border-cyan-100 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              UOK
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Emergency Contacts
          </h1>
          <p className="text-slate-600">
            Manage up to 3 trusted family or friends who will be notified about your check-ins
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contacts List */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Your Contacts ({contacts.length}/3)
            </h2>

            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white rounded-lg shadow border border-cyan-100 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {contact.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          {contact.type === "whatsapp" ? (
                            <>
                              <MessageCircle className="w-4 h-4 text-green-600" />
                              <span>WhatsApp</span>
                            </>
                          ) : (
                            <>
                              <Phone className="w-4 h-4 text-blue-600" />
                              <span>Phone</span>
                            </>
                          )}
                          <span className="font-mono">{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditContact(contact)}
                        className="p-2 hover:bg-cyan-50 rounded-lg transition text-cyan-600 hover:text-cyan-700"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-600">No contacts yet. Add your first one!</p>
            )}
          </div>

          {/* Add/Edit Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-6 h-fit sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? "Edit Contact" : "Add New Contact"}
            </h2>

            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Mom"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Type Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Method
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-200 transition text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? "Update Contact" : "Add Contact"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full py-2 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-slate-400 transition text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-slate-700">
                <span className="font-semibold">💡 Tip:</span> Your contacts will be notified immediately when you check in, and within 60 seconds if you miss a check-in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
