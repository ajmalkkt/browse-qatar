import React from "react";
import { X, Leaf, HeartHandshake } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFindDeals: () => void;
}

export default function SaveFoodPopup({ isOpen, onClose, onFindDeals }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      
      {/* 1. Backdrop (Darkened background) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* 
         2. The Modal Card 
         - max-h-[85vh]: Ensures 15% vertical space is left empty (top/bottom)
         - my-auto: Centers it vertically if content is short
         - flex flex-col: Allows us to make the body scrollable while header stays fixed
      */}
      <div className="relative bg-[#fdfbf7] w-full max-w-lg rounded-xl shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-double border-green-800/20 max-h-[98vh] flex flex-col my-auto">
        
        {/* Close Button (Floating on top right) */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white z-20 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 
           3. Fixed Header Section 
           (Stays visible when scrolling content)
        */}
        <div className="bg-green-800 text-white text-center py-5 px-4 relative flex-shrink-0">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <Leaf className="mx-auto mb-2 opacity-80" size={28} />
           <h2 className="text-xl md:text-3xl font-serif font-bold tracking-wide">No Waste... More Tasty!!!</h2>
           <p className="text-green-100 text-[15px] tracking-widest mt-1">A <span className="font-bold lowercase">browseqatar</span> Initiative</p>
        </div>

        {/* 
           4. Scrollable Body Section 
           - overflow-y-auto: Enables scrolling within this area only
           - flex-1: Takes up remaining height
        */}
        <div className="p-6 md:p-8 text-center overflow-y-auto flex-1">
          <div className="mb-4 text-green-700 opacity-20 flex justify-center">
             <HeartHandshake size={40} />
          </div>

          <p className="text-gray-700 font-serif text-lg leading-relaxed italic mb-4">
            "Every grain has a story, and every plate has a purpose. At <span className="font-bold text-green-800">browseqatar</span>, we believe great taste should never end in waste. 
          </p>
          
          <p className="text-gray-800 text-sm leading-relaxed mb-4">
            When you choose to <strong className="text-green-700">“Save food - No waste... More tasty!!!”</strong> you’re not just enjoying a delicious meal—you’re honoring the farmers who grew it, the hands that prepared it, and the planet that sustains us. 
          </p>

          <p className="text-gray-800 text-sm leading-relaxed mb-6">
            Join us in ordering mindfully, finishing joyfully, and sharing responsibly, so that no bite is forgotten and every meal makes a difference."
          </p>

          {/* CTA Button */}
          <button 
            onClick={onFindDeals}
            className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-base flex items-center justify-center gap-2 mb-2"
          >
             Find Today's Deals 🌿
          </button>
        </div>

        {/* Fixed Footer Stripe */}
        <div className="h-1.5 bg-green-800 w-full flex-shrink-0"></div>
      </div>
    </div>
  );
}