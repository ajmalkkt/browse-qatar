export interface FestivalOffer {
    id: number;
    image: string;
    title: string;
    subtitle: string;
    link?: string;
}

import type { FestivalThemeId } from "./festivalThemes";

export interface FestivalConfig {
    active: boolean;
    name: string; // e.g., "Ramadan", "Eid", "Xmas"
    badge: string; // e.g., "Ramadan Kareem", "Eid Mubarak"
    theme: FestivalThemeId;
    offers: FestivalOffer[];
}
const IS_FESTIVE_ACTIVE = import.meta.env.VITE_FESTIVAL_ACTIVE === "true";
export const CURRENT_FESTIVAL: FestivalConfig = {
    active: IS_FESTIVE_ACTIVE,
    name: "FIFA World Cup",
    badge: "FIFA World Cup 2026",
    theme: "football",
    offers: [
        {
            id: 1,
            image: "/images/ui/fifa-world-cup-2026.svg",
            title: "FIFA World Cup 2026",
            subtitle: "Click for the latest FIFA World Cup news and updates",
            link: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026"
        },
        {
            id: 2,
            image: "/images/ui/fifa-world-cup-2026.svg",
            title: "FIFA World Cup 2026",
            subtitle: "Click for the latest FIFA World Cup news and updates",
            link: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026"
        }
    ]
};
