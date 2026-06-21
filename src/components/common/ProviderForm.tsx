import React, { useState, useEffect } from "react";
import { Building2, Car, Wrench, User, UtensilsCrossed, Hotel, Briefcase, ShoppingBag, Users } from "lucide-react";
import { getAllVerticals, Vertical } from "../../services/verticalService";
import { countryMap, REQUIRE_API_KEY_FOR_ADS } from "../../config/appConfig";

const ICON_MAP: Record<string, any> = {
  UtensilsCrossed,
  Car,
  Building2,
  Hotel,
  Briefcase,
  ShoppingBag,
  Users,
  User,
  Wrench,
};

interface ProviderFormProps {
  providerForm: any;
  setProviderForm: React.Dispatch<React.SetStateAction<any>>;
  handleProviderFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleProviderSubmit: (e: React.FormEvent) => void;
  logoPreview: string | null;
  bannerPreview: string | null;
  isEditing?: boolean;
  isUploading?: boolean;
  apiKey: string;
  setApiKey: (val: string) => void;
}

export default function ProviderForm({
  providerForm,
  setProviderForm,
  handleProviderFormChange,
  handleProviderSubmit,
  logoPreview,
  bannerPreview,
  isEditing = false,
  isUploading = false,
  apiKey,
  setApiKey,
}: ProviderFormProps) {
  const [verticals, setVerticals] = useState<Vertical[]>([]);

  useEffect(() => {
    const fetchVerticals = async () => {
      const data = await getAllVerticals();
      setVerticals(data);
    };
    fetchVerticals();
  }, []);

  const selectedVertical = verticals.find((v) => v.id === providerForm.verticalId);
  const typeOptions = selectedVertical?.providerTypes?.length ? selectedVertical.providerTypes : ["Individual", "Organization", "Company"];

  return (
    <form
      onSubmit={handleProviderSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
    >
      {/* Vertical */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 tracking-wide">
          Ads Category *
        </label>
        <select
          name="verticalId"
          value={providerForm.verticalId}
          onChange={handleProviderFormChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
        >
          <option value="">-- Select Vertical --</option>
          {verticals.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* Provider Type */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 tracking-wide">
          Business / Provider Type *
        </label>
        <select
          name="type"
          value={providerForm.type}
          onChange={handleProviderFormChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
        >
          <option value="">-- Select Type --</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Name */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 tracking-wide">
          Business / Provider Name *
        </label>
        <input
          name="name"
          value={providerForm.name}
          onChange={handleProviderFormChange}
          required
          placeholder="e.g. Al Faris Motors"
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 tracking-wide">
          Email
        </label>
        <input
          name="email"
          type="email"
          value={providerForm.email}
          onChange={handleProviderFormChange}
          placeholder="contact@example.com"
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 tracking-wide">
          Phone
        </label>
        <input
          name="phone"
          value={providerForm.phone}
          onChange={handleProviderFormChange}
          placeholder="+974 XXXX XXXX"
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>

      {/* Country */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500  tracking-wide">
          Country *
        </label>
        <select
          name="country"
          value={providerForm.country || "Qatar"}
          onChange={handleProviderFormChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
        >
          {Object.values(countryMap).map((c) => (
            <option key={c as string} value={c as string}>
              {c as string}
            </option>
          ))}
        </select>
      </div>

      {/* Address - full width */}
      <div className="sm:col-span-2 lg:col-span-3 space-y-1">
        <label className="text-xs font-semibold text-gray-500 tracking-wide">
          Address
        </label>
        <input
          name="address"
          value={providerForm.address}
          onChange={handleProviderFormChange}
          placeholder="Street, Area, City"
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>

      {/* Logo Upload */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 tracking-wide">
          Logo Image
        </label>
        <input
          name="logo"
          type="file"
          accept="image/*"
          onChange={handleProviderFormChange}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {logoPreview && (
          <img
            src={logoPreview}
            alt="Logo preview"
            className="mt-2 h-14 w-14 rounded-full object-cover border-2 border-blue-100 shadow"
          />
        )}
      </div>

      {/* Banner Upload */}
      <div className="sm:col-span-2 space-y-1">
        <label className="text-xs font-semibold text-gray-500 tracking-wide">
          Banner / Cover Image
        </label>
        <input
          name="banner"
          type="file"
          accept="image/*"
          onChange={handleProviderFormChange}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        />
        {bannerPreview && (
          <img
            src={bannerPreview}
            alt="Banner preview"
            className="mt-2 h-16 w-48 rounded-lg object-cover border border-purple-100 shadow"
          />
        )}
      </div>
      
      {/* API Key */} 
      {REQUIRE_API_KEY_FOR_ADS == true && (<div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 tracking-wide">
          Enter Your Key *
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required={REQUIRE_API_KEY_FOR_ADS}
          placeholder="Enter API Key..."
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>)}

      {/* Submit */}
      <div className="sm:col-span-2 lg:col-span-3 pt-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={isUploading}
          className="bg-blue-600 text-white px-7 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-colors disabled:opacity-60 flex items-center gap-2 text-sm"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saving...
            </>
          ) : (
            isEditing ? "Update Provider" : "Add Provider"
          )}
        </button>
      </div>
    </form>
  );
}
