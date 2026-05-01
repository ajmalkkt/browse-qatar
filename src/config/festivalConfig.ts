export interface FestivalOffer {
    id: number;
    image: string;
    title: string;
    subtitle: string;
}

export interface FestivalConfig {
    active: boolean;
    name: string; // e.g., "Ramadan", "Eid", "Xmas"
    badge: string; // e.g., "Ramadan Kareem", "Eid Mubarak"
    offers: FestivalOffer[];
}
const IS_FESTIVE_ACTIVE = import.meta.env.VITE_FESTIVAL_ACTIVE === "true";
export const CURRENT_FESTIVAL: FestivalConfig = {
    active: IS_FESTIVE_ACTIVE,
    name: "Ramadan",
    badge: "Ramadan Kareem",
    offers: [
        {
            id: 1,
            image: "/images/offers/she-1.jpg",
            title: "Ramadan Special Feast",
            subtitle: "Experience the magic of Iftar with exclusive deals"
        },
        {
            id: 2,
            image: "/images/offers/she-2.jpg",
            title: "Suhoor Delights",
            subtitle: "Authentic flavors to brighten your nights"
        }
    ]
};
