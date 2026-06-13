import React from "react";

interface ListingFormProps {
  listingForm: any;
  setListingForm: React.Dispatch<React.SetStateAction<any>>;
  handleListingFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleListingUpload: (e: React.FormEvent) => void;
  listingPreview: string | null;
  listingGalleryPreviews: string[];
  removeGalleryImage?: (index: number) => void;
}

export default function ListingForm({
  listingForm,
  setListingForm,
  handleListingFormChange,
  handleListingUpload,
  listingPreview,
  listingGalleryPreviews,
  removeGalleryImage
}: ListingFormProps) {
  return (
    <form onSubmit={handleListingUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">Vertical</label>
        <select 
          name="verticalId" 
          value={listingForm.verticalId} 
          onChange={handleListingFormChange} 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="vehicles">Vehicles</option>
          <option value="accommodation">Accommodation</option>
          <option value="services">Services</option>
        </select>
      </div>

      <div className="md:col-span-1 lg:col-span-2 space-y-1">
        <label className="text-xs font-semibold text-gray-500">Title</label>
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
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">Original Price</label>
        <input 
          name="originalPrice" 
          type="number" 
          value={listingForm.originalPrice} 
          onChange={handleListingFormChange} 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
          required 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500">Discounted Price</label>
        <input 
          name="discountedPrice" 
          type="number" 
          value={listingForm.discountedPrice} 
          onChange={handleListingFormChange} 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
          required 
        />
      </div>

      <div className="space-y-1 md:col-span-2 lg:col-span-3">
        <label className="text-xs font-semibold text-gray-500">Unit (e.g., night, trip)</label>
        <input 
          name="unit" 
          value={listingForm.unit} 
          onChange={handleListingFormChange} 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>

      <div className="space-y-1 md:col-span-2 lg:col-span-3">
        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">Main Image *</label>
        <input 
          name="image" 
          type="file" 
          accept="image/*" 
          onChange={handleListingFormChange} 
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" 
          required={!listingForm.image} // Only require if no image exists (e.g. not in edit mode)
        />
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
      {listingForm.verticalId === "vehicles" && (
         <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-500">Make/Model</label>
               <input 
                 value={listingForm.attributes?.makeModel || ""} 
                 onChange={(e) => setListingForm((prev: any) => ({...prev, attributes: {...prev.attributes, makeModel: e.target.value}}))} 
                 className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
               />
            </div>
            <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-500">Year</label>
               <input 
                 type="number" 
                 value={listingForm.attributes?.year || ""} 
                 onChange={(e) => setListingForm((prev: any) => ({...prev, attributes: {...prev.attributes, year: e.target.value}}))} 
                 className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
               />
            </div>
            <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-500">Color</label>
               <input 
                 value={listingForm.attributes?.color || ""} 
                 onChange={(e) => setListingForm((prev: any) => ({...prev, attributes: {...prev.attributes, color: e.target.value}}))} 
                 className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
               />
            </div>
         </div>
      )}
      
      {listingForm.verticalId === "accommodation" && (
         <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-500">Property Type</label>
               <input 
                 value={listingForm.attributes?.propertyType || ""} 
                 onChange={(e) => setListingForm((prev: any) => ({...prev, attributes: {...prev.attributes, propertyType: e.target.value}}))} 
                 className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
               />
            </div>
            <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-500">Rooms</label>
               <input 
                 type="number" 
                 value={listingForm.attributes?.rooms || ""} 
                 onChange={(e) => setListingForm((prev: any) => ({...prev, attributes: {...prev.attributes, rooms: e.target.value}}))} 
                 className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
               />
            </div>
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

      <div className="md:col-span-2 lg:col-span-3 pt-2">
        <button type="submit" className="w-full md:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium shadow-md transition-colors">
          Upload Listing
        </button>
      </div>
    </form>
  );
}
