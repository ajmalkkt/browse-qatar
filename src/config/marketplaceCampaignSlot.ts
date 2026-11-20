export type MarketplaceCampaignAction =
  | { type: "popup" }
  | { type: "link"; url: string; openInNewTab?: boolean };

export interface MarketplaceCampaignSlotConfig {
  enabled: boolean;
  categoryIds: string[];
  contentType: "campaign" | "image";
  mobileLabel: string;
  label: string;
  title: string;
  description: string;
  desktopImage?: {
    src: string;
    alt: string;
  };
  action: MarketplaceCampaignAction;
  popup?: {
    title: string;
    eyebrow: string;
    paragraphs: string[];
  };
}

export const marketplaceCampaignSlot: MarketplaceCampaignSlotConfig = {
  enabled: true,
  categoryIds: ["restaurants"],
  contentType: "campaign",
  mobileLabel: " Eco Initiative",
  label: "bQ's Eco Initiative",
  title: "No Waste... More Tasty!!!",
  description: "Save food, celebrate every meal, and help reduce food waste.",
  action: { type: "popup" },
  popup: {
    title: "No Waste... More Tasty!!!",
    eyebrow: "A Browse Qatar Eco Initiative",
    paragraphs: [
      "Every grain has a story, and every plate has a purpose. Great taste should never end in waste.",
      "When you choose to save food, you help honor the farmers who grew it, the people who prepared it, and the planet that sustains us.",
      "Join us in ordering mindfully, enjoying every meal, and sharing responsibly. Browse restaurant offers and look for Super Saver deals when available.",
    ],
  },
};
