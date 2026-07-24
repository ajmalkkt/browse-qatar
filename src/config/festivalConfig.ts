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
    startDateTime?: string;
    endDateTime?: string;
    name: string; // e.g., "Ramadan", "Eid", "Xmas"
    badge: string; // e.g., "Ramadan Kareem", "Eid Mubarak"
    theme: FestivalThemeId;
    offers: FestivalOffer[];
}

const IS_FESTIVE_ACTIVE = import.meta.env.VITE_FESTIVAL_ACTIVE === "true";
const FESTIVAL_START_DATE_TIME = import.meta.env.VITE_FESTIVAL_START_DATE_TIME || undefined;
const FESTIVAL_END_DATE_TIME = import.meta.env.VITE_FESTIVAL_END_DATE_TIME || undefined;

const parseFestivalDate = (value?: string) => {
    if (!value) return null;

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const isFestivalActive = (festival: FestivalConfig, now = new Date()) => {
    if (!festival.active) return false;

    const startDateTime = parseFestivalDate(festival.startDateTime);
    const endDateTime = parseFestivalDate(festival.endDateTime);

    const hasStarted = !startDateTime || now >= startDateTime;
    const hasNotEnded = !endDateTime || now <= endDateTime;

    return hasStarted && hasNotEnded;
};

export const CURRENT_FESTIVAL: FestivalConfig = {
    active: IS_FESTIVE_ACTIVE,
    startDateTime: FESTIVAL_START_DATE_TIME,
    endDateTime: FESTIVAL_END_DATE_TIME,
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
