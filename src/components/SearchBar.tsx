import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface SearchSuggestion {
  id: number;
  type: "restaurant" | "offer";
  text: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

const SearchBar = ({ onSearch = () => {}, className = "" }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([
    { id: 1, type: "restaurant", text: "Spice Garden" },
    { id: 2, type: "restaurant", text: "Pizza Fiesta" },
    { id: 3, type: "restaurant", text: "Urban Bar & Grill" },
    { id: 4, type: "offer", text: "Weekend Buffet" },
    { id: 5, type: "offer", text: "Pizza Combo Deal" },
    { id: 6, type: "offer", text: "Happy Hour Drinks" },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Show popover with suggestions if there's text
    if (value.trim().length > 0) {
      setIsPopoverOpen(true);
      // Filter suggestions based on input
      // In a real app, this would likely be an API call
      const filteredSuggestions = suggestions.filter((suggestion) =>
        suggestion.text.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions(filteredSuggestions);
    } else {
      setIsPopoverOpen(false);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setIsPopoverOpen(false);
    onSearch(suggestion.text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsPopoverOpen(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsPopoverOpen(false);
  };

  return (
    <div className={`relative w-full max-w-[600px] bg-background ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full items-center"
      >
        <div className="relative flex-1">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search restaurants or offers..."
                  className="w-full pl-10 pr-10"
                  value={searchQuery}
                  onChange={handleInputChange}
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full p-0"
                    onClick={handleClear}
                  >
                    <span className="sr-only">Clear</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </Button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" sideOffset={5}>
              <Command>
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  {suggestions.length > 0 && (
                    <CommandGroup heading="Suggestions">
                      {suggestions.map((suggestion) => (
                        <CommandItem
                          key={suggestion.id}
                          onSelect={() => handleSuggestionSelect(suggestion)}
                          className="flex items-center"
                        >
                          {suggestion.type === "restaurant" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2 h-4 w-4"
                            >
                              <path d="M17 11V3h4v8h-4z" />
                              <path d="M17 21h4" />
                              <path d="M3 21h4" />
                              <path d="M3 7v4h4V3H3v4z" />
                              <path d="M3 15v2h4v-6H3v4z" />
                              <path d="M11 3v18" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2 h-4 w-4"
                            >
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                              <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                          )}
                          {suggestion.text}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button type="submit" className="ml-2">
          Search
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;
