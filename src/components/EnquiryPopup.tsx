import React, { useState, useEffect } from "react";
import { ENQUIRY_EMAIL } from "../config/appConfig";
import { sendEnquiryMessage } from "../services/enquiryService";

interface EnquiryPopupProps {
  open: boolean;
  onClose: () => void;
}

const EnquiryPopup: React.FC<EnquiryPopupProps> = ({ open, onClose }) => {
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

  // Email regex: basic valid pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Phone regex: optional "+", digits and hyphens only, no consecutive hyphens
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
      setError("Please enter enquiry details.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const res = await sendEnquiryMessage(details, name, email, phone);
      setSent(true);
      setDetails("");
      setName("");
      setEmail("");
      setPhone("");
    
    } catch {
      setError("Failed to send enquiry. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-2">Register Your Business</h2>

        <div className="mb-2">
          <span className="font-medium">Enquiry Email: </span>
          <span className="text-blue-700">{ENQUIRY_EMAIL}</span>
        </div>

        <div className="text-sm text-gray-600 mb-3">
          Please share your business enquiry details and contact information. We’ll get in touch with you soon.
        </div>

        <input
          type="name"
          className="w-full border rounded p-2 mb-2"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={sending || sent}
        />

        <input
          type="email"
          className="w-full border rounded p-2 mb-2"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={sending || sent}
        />

        <input
          type="tel"
          className="w-full border rounded p-2 mb-3"
          placeholder="Your Phone Number (e.g. +974 9876 5432)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={sending || sent}
        />

        <textarea
          className="w-full border rounded p-2 mb-3 min-h-[80px]"
          placeholder="Please describe your business or enquiry..E.g., I'd like to add my Cafe business. Ph: +974 9876 5432 or email@gmail.com"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          disabled={sending || sent}
        />

        {error && <div className="text-red-600 mb-3">{error}</div>}

        {sent ? (
          <div className="text-green-600 font-semibold">
            Enquiry sent successfully!
          </div>
        ) : (
          <button
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-60"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Enquiry"}
          </button>
        )}
      </div>
    </div>
  );
};

export default EnquiryPopup;
