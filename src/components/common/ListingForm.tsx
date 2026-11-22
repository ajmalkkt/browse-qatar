import { getAllVerticals, Vertical } from "../../services/verticalService";
import React,{useState, useEffect} from "react";
import { countryMap, REQUIRE_API_KEY_FOR_ADS } from "../../config/appConfig";
import { verticalConfig } from "../../config/verticalConfig";

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
  providers?: any[];
  providerId?: number | string;
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
  setApiKey,
  providers = [],
  providerId
}: ListingFormProps) {

  const [verticals, setVerticals] = useState<Vertical[]>([]);
  
  useEffect(() => {
    const fetchVerticals = async () => {
      const data = await getAllVerticals();
      setVerticals(data);
    };
    fetchVerticals();
  }, []);

  const activeVertical = verticals.find((vertical) => vertical.id === listingForm.verticalId);
  const configuredAttributes = verticalConfig[listingForm.verticalId]?.additionalAttributes || [];
  const attributeDefinitions = Array.from(
    new Map(
      [...configuredAttributes, ...(activeVertical?.additionalAttributes || [])].map((attribute) => [attribute.name, attribute])
    ).values()
  );
  const topLevelAttributeNames: Record<string, string[]> = {
    accommodations: ["transactionType", "propertyType"],
    services: ["serviceCategory"],
    vehicles: ["bodyType"],
    jobs: ["function", "careerLevel"],
    classifieds: ["classifiedCategory", "subcategory"],
  };
  const topLevelAttributeDefinitions = attributeDefinitions.filter(
    (attribute) => !topLevelAttributeNames[listingForm.verticalId]?.includes(attribute.name)
  );
  const promotedAttributes: Record<string, Array<{ name: string; label: string }>> = {
    vehicles: [{ name: "bodyType", label: "Vehicle type" }],
    jobs: [
      { name: "function", label: "Function" },
      { name: "careerLevel", label: "Career level" },
    ],
  };
  const getAttributeOptions = (name: string) => {
    const metadataFilter = activeVertical?.filters?.find((filter) => filter.key === name);
    const configuredFilter = verticalConfig[listingForm.verticalId]?.filters[name];
    const definition = attributeDefinitions.find((attribute) => attribute.name === name);
    return metadataFilter?.options || configuredFilter?.options || definition?.options || [];
  };
  const groupedAttributeDefinitions = Array.from(topLevelAttributeDefinitions.reduce((groups, attribute) => {
    const group = attribute.group || attribute.category || attribute.section || "Additional details";
    groups.set(group, [...(groups.get(group) || []), attribute]);
    return groups;
  }, new Map<string, typeof attributeDefinitions>()));

  useEffect(() => {
    if (!isEdit && activeVertical && !listingForm.category) {
      setListingForm((current) => ({ ...current, category: activeVertical.name }));
    }
  }, [activeVertical, isEdit, listingForm.category, setListingForm]);

  useEffect(() => {
    if (!providerId) return;
    const provider = providers.find((item) => String(item.id) === String(providerId));
    const providerPhone = typeof provider?.phone === "string" ? provider.phone.trim() : "";
    if (!isEdit) {
      setListingForm((current) => ({
        ...current,
        contactPhone: current.contactPhone?.trim() || providerPhone,
      }));
    } else if (!listingForm.contactPhone?.trim() && providerPhone) {
      setListingForm((current) => ({ ...current, contactPhone: providerPhone }));
    }
  }, [providerId, providers, isEdit, setListingForm]);

  const handleVerticalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vertical = verticals.find((item) => item.id === event.target.value);
    setListingForm((current) => ({
      ...current,
      verticalId: event.target.value,
      category: vertical?.name || "",
      subcategory: "",
      providerType: "",
      attributes: {},
    }));
  };

  const updateAttribute = (name: string, value: string | number) => {
    setListingForm((current) => ({
      ...current,
      attributes: { ...(current.attributes || {}), [name]: value },
    }));
  };

  return (
    <form onSubmit={handleListingUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">
          Category {isEdit && <span className="text-gray-400 font-normal">(locked in edit)</span>}
        </label>
        <select 
          name="verticalId" 
          value={listingForm.verticalId} 
          onChange={handleVerticalChange}
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
      
      {activeVertical && <>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">{
            listingForm.verticalId === "accommodations"
              ? "Property type *"
              : listingForm.verticalId === "services"
                ? "Service type *"
                : listingForm.verticalId === "classifieds"
                  ? "Item / service category *"
                : "Subcategory *"
          }</label>
          <select
            name="subcategory"
            value={listingForm.verticalId === "classifieds"
              ? listingForm.attributes?.classifiedCategory || listingForm.subcategory || ""
              : listingForm.subcategory || ""}
            onChange={(event) => {
              handleListingFormChange(event);
              if (listingForm.verticalId === "accommodations") {
                setListingForm((current) => ({
                  ...current,
                  subcategory: event.target.value,
                  attributes: { ...(current.attributes || {}), propertyType: event.target.value },
                }));
              }
              if (listingForm.verticalId === "services") {
                setListingForm((current) => ({
                  ...current,
                  subcategory: event.target.value,
                  attributes: { ...(current.attributes || {}), serviceCategory: event.target.value },
                }));
              }
              if (listingForm.verticalId === "classifieds") {
                setListingForm((current) => ({
                  ...current,
                  subcategory: event.target.value,
                  attributes: { ...(current.attributes || {}), classifiedCategory: event.target.value },
                }));
              }
            }}
            required
            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{
              listingForm.verticalId === "accommodations"
                ? "-- Select Property Type --"
                : listingForm.verticalId === "services"
                  ? "-- Select Service Type --"
                  : listingForm.verticalId === "classifieds"
                    ? "-- Select an item or service category --"
                  : "-- Select Subcategory --"
            }</option>
            {listingForm.verticalId === "classifieds" &&
              listingForm.subcategory &&
              !(activeVertical.subcategories || []).includes(listingForm.attributes?.classifiedCategory || listingForm.subcategory) && (
                <option value={listingForm.attributes?.classifiedCategory || listingForm.subcategory}>
                  {listingForm.attributes?.classifiedCategory || listingForm.subcategory}
                </option>
              )}
            {(activeVertical.subcategories || []).map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
          </select>
        </div>
        {(promotedAttributes[listingForm.verticalId] || []).map((attribute) => (
          <div key={attribute.name} className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">{attribute.label}</label>
            <select
              value={listingForm.attributes?.[attribute.name] || ""}
              onChange={(event) => updateAttribute(attribute.name, event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select {attribute.label} --</option>
              {getAttributeOptions(attribute.name).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
        {listingForm.verticalId === "accommodations" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Transaction type *</label>
            <select
              name="transactionType"
              value={listingForm.attributes?.transactionType || ""}
              onChange={(event) => updateAttribute("transactionType", event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Transaction Type --</option>
              <option value="For Rent">For Rent</option>
              <option value="For Sale">For Sale</option>
            </select>
          </div>
        )}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">Owner / Seller Type</label>
          <input
            name="providerType"
            list="owner-seller-types"
            value={listingForm.providerType || ""}
            onChange={handleListingFormChange}
            placeholder="Select or type a type"
            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="owner-seller-types">
            {(activeVertical.providerTypes || []).map((providerType) => <option key={providerType} value={providerType} />)}
          </datalist>
        </div>
      </>}

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

      {(listingForm.verticalId === "accommodations" || listingForm.verticalId === "jobs") && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">
            {listingForm.verticalId === "jobs" ? "Open Position" : "Unit (e.g., night, month)"}
          </label>
          <input 
            name="unit" 
            value={listingForm.unit || ""} 
            onChange={handleListingFormChange} 
            placeholder={listingForm.verticalId === "jobs" ? "e.g., 3" : "e.g., night, month"}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
      )}

      <div className="space-y-1">
        <div className="h-6" aria-hidden="true" />
        <label className="block text-xs font-semibold text-gray-500">Valid From</label>
        <input 
          name="validFrom" 
          type="date"
          value={listingForm.validFrom || ""} 
          onChange={handleListingFormChange} 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>

      <div className="space-y-1">
        <p
          title="Default expiry is one week. Change Valid To if you need the listing to run longer."
          className="h-6 truncate rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium leading-4 text-amber-800"
        >
          Default expiry is one week. Change Valid To if you need the listing to run longer.
        </p>
        <label className="block text-xs font-semibold text-gray-500">Valid To</label>
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

      <div className="space-y-1 md:col-span-1">
        <label className="text-xs font-semibold text-gray-500">Phone Number *</label>
        <input
          name="contactPhone"
          type="tel"
          value={listingForm.contactPhone || ""}
          onChange={handleListingFormChange}
          placeholder="+974 1234 5678"
          required
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
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
      {attributeDefinitions.length > 0 && (
          <div className="md:col-span-2 lg:col-span-3 space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div>
              <h3 className="text-sm font-bold text-gray-700">Additional details <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Optional</span></h3>
              <p className="mt-1 text-xs text-gray-500">Add specifications to help people find and compare this listing.</p>
            </div>
            {groupedAttributeDefinitions.map(([group, attributes]) => <section key={group} className="space-y-3">
              <h4 className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wide text-gray-500">{group}</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {attributes.map((attr) => {
              const value = listingForm.attributes?.[attr.name] ?? "";
              const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                const nextValue = attr.type === "number" && event.target.value !== ""
                  ? Number(event.target.value)
                  : event.target.value;
                updateAttribute(attr.name, nextValue);
              };
              
              return (
                <div key={attr.name} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">
                    {attr.label} {attr.required && "*"}
                  </label>
                  {attr.type === "select" ? (
                    attr.name === "bodyType" ? (
                      <>
                        <input
                          list="vehicle-type-options"
                          value={value}
                          onChange={handleChange}
                          required={attr.required}
                          placeholder="Select or type a vehicle type"
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                        />
                        <datalist id="vehicle-type-options">
                          {attr.options?.map((opt: string) => <option key={opt} value={opt} />)}
                        </datalist>
                      </>
                    ) : (
                    <select
                      value={value}
                      onChange={handleChange}
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
                    )
                  ) : attr.type === "textarea" ? (
                    <textarea
                        value={value}
                        onChange={handleChange}
                        required={attr.required}
                        rows={3}
                        placeholder={`Enter ${attr.label.toLowerCase()} (comma-separated)`}
                        className="w-full resize-y rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type={attr.type === "number" ? "number" : "text"}
                      value={value}
                      onChange={handleChange}
                      required={attr.required}
                      placeholder={`Enter ${attr.label.toLowerCase()}`}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  )}
                </div>
              );
            })}
              </div>
            </section>)}
          </div>
      )}

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
