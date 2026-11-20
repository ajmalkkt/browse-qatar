import FestivalBanner from "./FestivalBanner";

export default function FestivalFloatingPromotion() {
  return (
    <div className="pointer-events-none fixed bottom-24 right-3 z-40 sm:bottom-6 sm:right-6">
      <div className="pointer-events-auto">
        <FestivalBanner />
      </div>
    </div>
  );
}
