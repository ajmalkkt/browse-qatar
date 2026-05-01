import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SHOW_DISCOUNTED_PRICE } from "../config/appConfig";
import { Calendar, MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface OfferCardProps {
  id: number;
  title: string;
  description: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantLogo: string;
  cuisine: string;
  originalPrice: number;
  discountedPrice: number;
  offerType: string;
  validFrom: string;
  validTo: string;
  location: string;
  discountPercentage?: number;
}

const OfferCard = ({
  id = 1,
  title = "Weekend Buffet - 30% Off",
  description = "Enjoy unlimited starters, mains, and desserts at a flat 30% discount.",
  restaurantName = "Spice Garden",
  restaurantAddress = "West Bay, Doha",
  restaurantLogo = "https://api.dicebear.com/7.x/avataaars/svg?seed=restaurant",
  cuisine = "Indian",
  originalPrice = 1200,
  discountedPrice = 840,
  offerType = "Buffet",
  validFrom = "2025-09-01",
  validTo = "2025-09-30",
  location = "Bangalore, MG Road",
  discountPercentage = 30,
}: OfferCardProps) => {
  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDirections = (restaurantAddress) => {
    if (!restaurantAddress) return;

    const address = encodeURIComponent(restaurantAddress);
    
    // Option 1: Open specifically in "Directions" mode (Current Location -> Destination)
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}`;

    // Option 2: Open just the location pin
    // const mapUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;

    // Open in a new tab
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="w-full max-w-[320px] h-[340px] overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
      <CardHeader className="p-3 pb-0 relative">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={restaurantLogo} alt={restaurantName} />
              <AvatarFallback>{restaurantName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm line-clamp-1 flex items-center gap-1">
                {restaurantName}
                {restaurantAddress && (
                  <>
                    <MapPin className="inline h-4 w-4 text-muted-foreground"
                    onClick={() => handleDirections(restaurantAddress)}  />
                    <span>{restaurantAddress}</span>
                  </>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">{cuisine}</p>
            </div>
          </div>
          <Badge variant="destructive" className="bg-red-600">
            {SHOW_DISCOUNTED_PRICE
              ? <span className="text-lg font-bold text-primary">₹{discountedPrice}</span>
              : <>{discountPercentage}% OFF</>}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-2">
        <h2 className="text-lg font-bold mb-0.5 line-clamp-1">{title}</h2>

  <div className="flex items-center gap-2 mb-0.5">
          <Badge variant="outline" className="bg-muted/50">
            {offerType}
          </Badge>
        </div>

  <div className="flex items-center justify-between mb-0.5">
          <div>
            <p className="text-xs text-muted-foreground">Original Price</p>
            <p className="text-sm line-through text-muted-foreground">
              ₹{originalPrice}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Offer Price</p>
            <p className="text-lg font-bold text-primary">₹{discountedPrice}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex flex-col items-start gap-1 border-t">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            Valid: {formatDate(validFrom)} - {formatDate(validTo)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{location}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OfferCard;
