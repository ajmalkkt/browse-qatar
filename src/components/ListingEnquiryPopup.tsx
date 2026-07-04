import React, { useState, useEffect } from "react";
import { sendListingEnquiryMessage } from "../services/enquiryService";

interface ListingEnquiryPopupProps {
  open: boolean;
  onClose: () => void;
  listingId: number | string;
  adTitle: string;
}

const ListingEnquiryPopup: React.FC<ListingEnquiryPopupProps> = ({ 
  open, 
  onClose,
  listingId,
  adTitle
}) => {
  const [details, setDetails] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setDetails("");
      setName("");
      setEmail("");
      setPhone("");
      setSent(false);
      setError("");
    }
  }, [open]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9]+(-[0-9]+)*$/;

  const handleSend = async () => {
    if (!email.trim() && !phone.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    if (email && !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (phone && !phoneRegex.test(phone)) {
      setError("Phone number can contain digits, optional '+', and single hyphen (e.g., +91-9812345678).");
      return;
    }

    if (!details.trim()) {
      setError("Please enter your enquiry message.");
      return;
    }

    setSending(true);
    setError("");
    try {
      await sendListingEnquiryMessage(listingId, details, name, email, phone);
      setSent(true);
      setDetails("");
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      setError("Failed to send enquiry. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold transition-colors"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-900 pr-6">
          Send your enquiry about <span className="text-blue-600">{adTitle}</span>
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Please fill in your contact information and message. The Ad owner will get in touch with you shortly.
        </p>

        <div className="space-y-3">
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={sending || sent}
          />

          <input
            type="email"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sending || sent}
          />

          <input
            type="tel"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your Phone Number (e.g. +974 9876 5432)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={sending || sent}
          />

          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask about availability, price details, or request a callback..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            disabled={sending || sent}
          />

          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}

          {sent ? (
            <div className="text-green-600 font-bold text-center py-2 bg-green-50 rounded-xl border border-green-100 text-sm">
              ✓ Enquiry sent successfully!
            </div>
          ) : (
            <button
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition shadow-md shadow-blue-100 text-sm"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Enquiry"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingEnquiryPopup;
