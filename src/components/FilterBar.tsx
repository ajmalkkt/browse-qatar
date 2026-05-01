import React, { useState } from "react";
import { cuisineOptions as cfgCuisineOptions, locationOptions as cfgLocationOptions, offerTypeOptions as cfgOfferTypeOptions, SHOW_OFFER_TYPE_FILTER } from "../config/appConfig";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterBarProps {
  onFilterChange?: (filters: {
    cuisines: string[];
    locations: string[];
    offerTypes: string[];
  }) => void;
}

const FilterBar = ({ onFilterChange = () => {} }: FilterBarProps) => {
  // Use canonical option arrays from config so filters match application data
  // Exclude the "All" entry from individual dropdown lists
  const cuisineOptions = cfgCuisineOptions.filter((c) => c !== "All");
  const locationOptions = cfgLocationOptions.filter((l) => l !== "All");
  const offerTypeOptions = cfgOfferTypeOptions.filter((t) => t !== "All");

  // State for selected filters
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedOfferTypes, setSelectedOfferTypes] = useState<string[]>([]);

  // Handle filter changes
  const handleCuisineChange = (cuisine: string) => {
    const updatedCuisines = selectedCuisines.includes(cuisine)
      ? selectedCuisines.filter((c) => c !== cuisine)
      : [...selectedCuisines, cuisine];

    setSelectedCuisines(updatedCuisines);
    triggerFilterChange(updatedCuisines, selectedLocations, selectedOfferTypes);
  };

  const handleLocationChange = (location: string) => {
    const updatedLocations = selectedLocations.includes(location)
      ? selectedLocations.filter((l) => l !== location)
      : [...selectedLocations, location];

    setSelectedLocations(updatedLocations);
    triggerFilterChange(selectedCuisines, updatedLocations, selectedOfferTypes);
  };

  const handleOfferTypeChange = (offerType: string) => {
    const updatedOfferTypes = selectedOfferTypes.includes(offerType)
      ? selectedOfferTypes.filter((o) => o !== offerType)
      : [...selectedOfferTypes, offerType];

    setSelectedOfferTypes(updatedOfferTypes);
    triggerFilterChange(selectedCuisines, selectedLocations, updatedOfferTypes);
  };

  const triggerFilterChange = (
    cuisines: string[],
    locations: string[],
    offerTypes: string[],
  ) => {
    onFilterChange({ cuisines, locations, offerTypes });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCuisines([]);
    setSelectedLocations([]);
    setSelectedOfferTypes([]);
    triggerFilterChange([], [], []);
  };

  // Remove a specific filter
  const removeFilter = (
    type: "cuisine" | "location" | "offerType",
    value: string,
  ) => {
    if (type === "cuisine") {
      const updated = selectedCuisines.filter((c) => c !== value);
      setSelectedCuisines(updated);
      triggerFilterChange(updated, selectedLocations, selectedOfferTypes);
    } else if (type === "location") {
      const updated = selectedLocations.filter((l) => l !== value);
      setSelectedLocations(updated);
      triggerFilterChange(selectedCuisines, updated, selectedOfferTypes);
    } else if (type === "offerType") {
      const updated = selectedOfferTypes.filter((o) => o !== value);
      setSelectedOfferTypes(updated);
      triggerFilterChange(selectedCuisines, selectedLocations, updated);
    }
  };

  // Get label for a filter by its ID
  const getFilterLabel = (
    type: "cuisine" | "location" | "offerType",
    id: string,
  ): string => {
  // We use the actual string values as IDs/labels, so return directly
  return id;
  };

  // Count total active filters
  const totalActiveFilters =
    selectedCuisines.length +
    selectedLocations.length +
    selectedOfferTypes.length;

  return (
  <div className="w-full bg-white p-2 rounded-lg shadow-sm border border-gray-100">
      {/* Small heading with filter icon */}
  <div className="flex items-center gap-1 mb-1">
        <span className="inline-block w-4 h-4 text-gray-500">
          {/* Inline SVG for filter icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A2 2 0 0013 14.586V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-3.414a2 2 0 00-.293-1.172L2.293 6.707A1 1 0 012 6V4z" />
          </svg>
        </span>
        <span className="text-gray-700 font-semibold text-sm tracking-wide uppercase">Filters</span>
      </div>
  <div className="flex flex-wrap items-center gap-2">
        {/* Cuisine Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Cuisine
              {selectedCuisines.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedCuisines.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {cuisineOptions.map((cuisine) => (
              <DropdownMenuCheckboxItem
                key={cuisine}
                checked={selectedCuisines.includes(cuisine)}
                onCheckedChange={() => handleCuisineChange(cuisine)}
              >
                {cuisine}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Location Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Location
              {selectedLocations.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedLocations.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {locationOptions.map((location) => (
              <DropdownMenuCheckboxItem
                key={location}
                checked={selectedLocations.includes(location)}
                onCheckedChange={() => handleLocationChange(location)}
              >
                {location}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Offer Type Filter (conditionally rendered) */}
        {SHOW_OFFER_TYPE_FILTER && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Offer Type
                {selectedOfferTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedOfferTypes.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {offerTypeOptions.map((offerType) => (
                <DropdownMenuCheckboxItem
                  key={offerType}
                  checked={selectedOfferTypes.includes(offerType)}
                  onCheckedChange={() => handleOfferTypeChange(offerType)}
                >
                  {offerType}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear Filters Button */}
        {totalActiveFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Clear All
            <X className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {totalActiveFilters > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedCuisines.map((cuisine) => (
            <Badge key={cuisine} variant="outline" className="px-3 py-1">
              {getFilterLabel("cuisine", cuisine)}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => removeFilter("cuisine", cuisine)}
              />
            </Badge>
          ))}
          {selectedLocations.map((location) => (
            <Badge key={location} variant="outline" className="px-3 py-1">
              {getFilterLabel("location", location)}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => removeFilter("location", location)}
              />
            </Badge>
          ))}
          {selectedOfferTypes.map((offerType) => (
            <Badge key={offerType} variant="outline" className="px-3 py-1">
              {getFilterLabel("offerType", offerType)}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => removeFilter("offerType", offerType)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
