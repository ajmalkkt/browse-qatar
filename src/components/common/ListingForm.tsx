import { getAllVerticals, Vertical } from "../../services/verticalService";
import React,{useState, useEffect} from "react";
import { countryMap, REQUIRE_API_KEY_FOR_ADS } from "../../config/appConfig";

interface ListingFormProps {
  listingForm: any;
  setListingForm: React.Dispatch<React.SetStateAction<any>>;
  handleListingFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleListingUpload: (e: React.FormEvent) => void;
  listingPreview: string | null;
  listingGalleryPreviews: string[];
  removeGalleryImage?: (index: number) => void;
  isAdmin?: boolean;
  isEdit?: boolean;
  updateImage?: boolean;
  setUpdateImage?: (val: boolean) => void;
  apiKey: string;
  setApiKey: (val: string) => void;
}

export default function ListingForm({
  listingForm,
  setListingForm,
  handleListingFormChange,
  handleListingUpload,
  listingPreview,
  listingGalleryPreviews,
  removeGalleryImage,
  isAdmin,
  isEdit,
  updateImage,
  setUpdateImage,
  apiKey,
  setApiKey
}: ListingFormProps) {

  const [verticals, setVerticals] = useState<Vertical[]>([]);
  
  useEffect(() => {
    const fetchVerticals = async () => {
      const data = await getAllVerticals();
      setVerticals(data);
    };
    fetchVerticals();
  }, []);

  return (
    <form onSubmit={handleListingUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">
          Ads Sector {isEdit && <span className="text-gray-400 font-normal">(locked in edit)</span>}
        </label>
        <select 
          name="verticalId" 
          value={listingForm.verticalId} 
          onChange={handleListingFormChange} 
          disabled={isEdit}
          className={`w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white ${isEdit ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
        >
          <option value="">-- Select Category --</option>
          {verticals.filter((v) => v.id !== 'restaurants').map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1 lg:col-span-2 space-y-1">
        <label className="text-xs font-semibold text-gray-500">Title *</label>
        <input 
          name="title" 
          value={listingForm.title} 
          onChange={handleListingFormChange} 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
          required 
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">Category</label>
        <input 
          name="category" 
          value={listingForm.category} 
          onChange={handleListingFormChange} 
          placeholder="e.g.Sedan, Hotel, IT Services, etc."
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">
          {listingForm.verticalId === "jobs" ? "Salary Offered *" : "Price *"}
        </label>
        <input 
          name="originalPrice" 
          type="number" 
          value={listingForm.originalPrice} 
          onChange={handleListingFormChange} 
          placeholder={listingForm.verticalId === "jobs" ? "Enter salary offered..." : "Expected price..."}
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
          required 
        />
      </div>

      {(listingForm.verticalId === "accommodations" || listingForm.verticalId === "vehicles" || listingForm.verticalId === "jobs") && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">
            {listingForm.verticalId === "jobs" ? "Open Position" : "Unit (e.g., night, trip)"}
          </label>
          <input 
            name="unit" 
            value={listingForm.unit || ""} 
            onChange={handleListingFormChange} 
            placeholder={listingForm.verticalId === "jobs" ? "e.g., 3" : "e.g., night, trip"}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">Valid From</label>
        <input 
          name="validFrom" 
          type="date"
          value={listingForm.validFrom || ""} 
          onChange={handleListingFormChange} 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">Valid To</label>
        <input 
          name="validTo" 
          type="date"
          value={listingForm.validTo || ""} 
          onChange={handleListingFormChange} 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
          required
        />
      </div>

      {/* Country Selection */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">Country *</label>
        <select
          name="country"
          value={listingForm.country || "Qatar"}
          onChange={handleListingFormChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
        >
          {Object.values(countryMap).map((c) => (
            <option key={c as string} value={c as string}>{c as string}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">City</label>
        <input 
          name="city" 
          value={listingForm.city || ""} 
          onChange={handleListingFormChange} 
          placeholder="e.g. Doha"
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
        />
      </div>

      {/* Address */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">Address</label>
        <input 
          name="address" 
          value={listingForm.address || ""} 
          onChange={handleListingFormChange} 
          placeholder="e.g. West Bay"
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
        />
      </div>

      <div className="space-y-1 md:col-span-2 lg:col-span-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            Main Image {(!isEdit || updateImage) && "*"}
          </label>
          {isEdit && setUpdateImage && (
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={updateImage || false}
                onChange={(e) => setUpdateImage(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Enable new image upload
            </label>
          )}
        </div>
        
        {(!isEdit || updateImage) && (
          <input 
            name="image" 
            type="file" 
            accept="image/*" 
            onChange={handleListingFormChange} 
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mt-2" 
            required={!isEdit || updateImage}
          />
        )}
        {listingPreview && <img src={listingPreview} alt="Preview" className="h-12 w-12 rounded border object-cover mt-2" />}
      </div>

      <div className="space-y-1 md:col-span-2 lg:col-span-3">
        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">Gallery Images (Max 5)</label>
        
        {/* Hidden file input */}
        <input 
          id="gallery-upload"
          name="galleryUrls" 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={(e) => {
            handleListingFormChange(e);
            // Reset input value so the same file can be selected again if needed
            e.target.value = '';
          }} 
          className="hidden" 
        />
        
        <div className="flex gap-3 flex-wrap mt-2">
          {listingGalleryPreviews.map((preview, idx) => (
             <div key={idx} className="relative group">
               <img src={preview} alt={`Gallery Preview ${idx}`} className="h-16 w-16 rounded-lg border object-cover shadow-sm" />
               <button 
                 type="button" 
                 onClick={() => removeGalleryImage && removeGalleryImage(idx)}
                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 focus:outline-none"
                 title="Remove image"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
             </div>
          ))}

          {listingGalleryPreviews.length < 5 && (
            <label htmlFor="gallery-upload" className="h-16 w-16 flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] font-medium mt-1 text-center leading-tight">Add<br/>Image</span>
            </label>
          )}
        </div>
      </div>

      {/* Dynamic Attributes Based on Vertical */}
      {(() => {
        const activeVertical = verticals.find((v) => v.id === listingForm.verticalId);
        if (!activeVertical || !activeVertical.additionalAttributes || activeVertical.additionalAttributes.length === 0) {
          return null;
        }
        return (
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            {activeVertical.additionalAttributes.map((attr: any) => {
              const value = listingForm.attributes?.[attr.name] || "";
              const handleChange = (val: any) => {
                setListingForm((prev: any) => ({
                  ...prev,
                  attributes: {
                    ...(prev.attributes || {}),
                    [attr.name]: val,
                  },
                }));
              };
              
              return (
                <div key={attr.name} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">
                    {attr.label} {attr.required && "*"}
                  </label>
                  {attr.type === "select" ? (
                    <select
                      value={value}
                      onChange={(e) => handleChange(e.target.value)}
                      required={attr.required}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                    >
                      <option value="">-- Select {attr.label} --</option>
                      {attr.options?.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={attr.type || "text"}
                      value={value}
                      onChange={(e) => handleChange(e.target.value)}
                      required={attr.required}
                      placeholder={`Enter ${attr.label.toLowerCase()}`}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      <div className="md:col-span-2 lg:col-span-3 space-y-1">
        <label className="text-xs font-semibold text-gray-500">Description</label>
        <textarea 
          name="description" 
          rows={3} 
          value={listingForm.description} 
          onChange={handleListingFormChange} 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>

      {isAdmin && isEdit && (
        <div className="md:col-span-2 lg:col-span-3 flex items-center gap-2 pt-2">
          <input 
            type="checkbox" 
            name="active" 
            id="activeCheckbox"
            checked={!!listingForm.active} 
            onChange={(e) => setListingForm((prev: any) => ({ ...prev, active: e.target.checked }))} 
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" 
          />
          <label htmlFor="activeCheckbox" className="text-sm font-bold text-gray-700 cursor-pointer">
            Activate Listing (Sets active and status)
          </label>
        </div>
      )}

      {/* API Key */}
      {REQUIRE_API_KEY_FOR_ADS == true && (<div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">
          Enter your Key *
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

      <div className="md:col-span-2 lg:col-span-3 pt-2">
        <button type="submit" className="w-full md:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium shadow-md transition-colors">
          {isEdit ? "Update Listing" : "Upload Ads"}
        </button>
      </div>
    </form>
  );
}
