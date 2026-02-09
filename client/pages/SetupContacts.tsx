import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Plus, X, Copy, Check, QrCode, Mail, Send } from "lucide-react";

interface BondedContact {
  id: string;
  name: string;
  bondCode: string;
  qrCode: string;
  status: "pending" | "bonded";
  bondedAt?: string;
  email?: string;
}

export default function SetupContacts() {
  const [contacts, setContacts] = useState<BondedContact[]>([]);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedContactId, setExpandedContactId] = useState<string | null>(
    null,
  );
  const [emailModalContactId, setEmailModalContactId] = useState<string | null>(
    null,
  );
  const [emailInput, setEmailInput] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Contact name is required";
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

  // Simple QR code generation using data URL
  const generateQRCode = (text: string): string => {
    // This creates a basic QR code using a free QR code service
    // In production, use qrcode.react or similar library
    const encodedText = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedText}`;
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && contacts.length < 10) {
      const bondCode = generateBondCode();
      const newContact: BondedContact = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        bondCode: bondCode,
        qrCode: generateQRCode(bondCode),
        status: "pending",
      };
      setContacts([...contacts, newContact]);
      setFormData({ name: "" });
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

  const handleSendBondCodeViaEmail = async (
    contactId: string,
    bondCode: string,
  ) => {
    if (!emailInput.trim()) {
      alert("Please enter an email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      alert("Please enter a valid email address");
      return;
    }

    setSendingEmail(true);
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}",
      );
      const userUsername = currentUser.username || "UOK User";
      const userDisplayName = currentUser.name || "A friend";

      const response = await fetch("https://formsubmit.co/afenteng@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _subject: `UOK Bond Code for ${userDisplayName}`,
          _captcha: "false",
          recipient_email: emailInput.trim(),
          sender_name: userDisplayName,
          sender_username: userUsername,
          contact_name:
            contacts.find((c) => c.id === contactId)?.name || "Contact",
          bond_code: bondCode,
          message: `Hi! I'd like to bond with you on UOK. Please use this bond code to connect: ${bondCode}\n\nOr scan the QR code I'll send you separately. Let's stay connected!`,
        }),
      });

      if (response.ok) {
        // Update contact with email
        const updatedContacts = contacts.map((c) =>
          c.id === contactId ? { ...c, email: emailInput.trim() } : c,
        );
        setContacts(updatedContacts);

        alert(`Bond code sent to ${emailInput}!`);
        setEmailModalContactId(null);
        setEmailInput("");
      } else {
        alert("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending bond code via email:", error);
      alert("Error sending email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleContinue = () => {
    // Save contacts and navigate to dashboard
    const bondedContacts = contacts.map((c) => ({
      ...c,
      status: "pending" as const,
    }));
    localStorage.setItem("bondedContacts", JSON.stringify(bondedContacts));
    console.log("Emergency contacts created:", bondedContacts);
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
                Generate QR codes to bond with trusted family and emergency
                contacts. They can scan the code to connect with you instantly.
              </p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Current Contacts */}
              {contacts.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Your Bonded Contacts ({contacts.length}/10)
                  </h2>
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-cyan-50 rounded-lg border border-cyan-200 overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-4">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">
                              {contact.name}
                            </p>
                            <p className="text-sm text-slate-600 mt-1 font-mono">
                              {contact.bondCode}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setExpandedContactId(
                                  expandedContactId === contact.id
                                    ? null
                                    : contact.id,
                                )
                              }
                              className="p-2 hover:bg-cyan-100 rounded transition text-cyan-600"
                              title="View QR code"
                            >
                              <QrCode className="w-5 h-5" />
                            </button>
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
                            <button
                              onClick={() => setEmailModalContactId(contact.id)}
                              className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                              title="Send bond code via email"
                            >
                              <Mail className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRemoveContact(contact.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition text-red-500 hover:text-red-600"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded QR Code */}
                        {expandedContactId === contact.id && (
                          <div className="bg-white border-t border-cyan-200 p-6 flex flex-col items-center gap-4">
                            <img
                              src={contact.qrCode}
                              alt={`QR code for ${contact.name}`}
                              className="w-64 h-64 border-2 border-cyan-300 rounded-lg p-2 bg-white"
                            />
                            <p className="text-sm text-slate-600 text-center max-w-sm">
                              Let {contact.name} scan this QR code with their
                              phone camera to bond with you instantly
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Contact Form */}
              {contacts.length < 10 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    {contacts.length === 0
                      ? "Add Your First Emergency Contact"
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
                        placeholder="e.g., Mom, Brother, Doctor"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        No email address needed - share the QR code directly
                      </p>
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name}
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
                  <span className="font-semibold">How bonding works:</span>
                  <br />
                  1. Enter the contact name (no email needed)
                  <br />
                  2. A unique QR code is generated for that contact
                  <br />
                  3. Share the QR code - they scan it with their phone camera
                  <br />
                  4. Or manually share the bond code for them to enter in the
                  app
                  <br />
                  5. Optionally send the bond code via email
                  <br />
                  6. Once bonded, you receive their check-in alerts and
                  notifications
                </p>
              </div>

              {/* Email Modal */}
              {emailModalContactId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        Send Bond Code via Email
                      </h3>
                      <button
                        onClick={() => {
                          setEmailModalContactId(null);
                          setEmailInput("");
                        }}
                        className="p-1 hover:bg-slate-100 rounded transition"
                      >
                        <X className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 mb-4">
                      Send the bond code to{" "}
                      <span className="font-semibold">
                        {
                          contacts.find((c) => c.id === emailModalContactId)
                            ?.name
                        }
                      </span>
                      's email address
                    </p>

                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="their@email.com"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition mb-4"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEmailModalContactId(null);
                          setEmailInput("");
                        }}
                        className="flex-1 py-2 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-slate-400 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const contact = contacts.find(
                            (c) => c.id === emailModalContactId,
                          );
                          if (contact) {
                            handleSendBondCodeViaEmail(
                              emailModalContactId,
                              contact.bondCode,
                            );
                          }
                        }}
                        disabled={sendingEmail}
                        className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {sendingEmail ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
