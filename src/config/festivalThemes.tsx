import type { CSSProperties, ReactNode } from "react";

export type FestivalThemeId = "arabian" | "football";

export interface FestivalBackgroundStarConfig {
    count: number;
    color: string;
    sizeOptions: number[];
    opacity: number;
    animationDelayStep: number;
    animationDurationBase: number;
    animationDurationVariance: number;
}

export interface FestivalBackgroundElementConfig {
    id: string;
    className?: string;
    style?: CSSProperties;
    node: ReactNode;
}

export interface FestivalTheme {
    id: FestivalThemeId;
    background: {
        stars: FestivalBackgroundStarConfig;
        elements: FestivalBackgroundElementConfig[];
    };
}

export const FESTIVAL_THEMES: Record<FestivalThemeId, FestivalTheme> = {
    arabian: {
        id: "arabian",
        background: {
            stars: {
                count: 20,
                color: "#fcd34d",
                sizeOptions: [1.2, 1.8, 2.4],
                opacity: 0.7,
                animationDelayStep: 0.3,
                animationDurationBase: 1.5,
                animationDurationVariance: 2
            },
            elements: [
                {
                    id: "moon",
                    style: {
                        top: 15,
                        left: 15,
                        width: 48,
                        height: 48
                    },
                    className: "absolute text-amber-300 animate-glitter opacity-90 blur-[0.5px]",
                    node: (
                        <svg viewBox="0 0 24 24" className="w-full h-full fill-current drop-shadow-[0_0_15px_rgba(252,211,77,0.9)]">
                            <path d="M12 3c.132 0 .263 0 .393.007a9 9 0 0 0 7.23 15.115A9 9 0 1 1 12 3z" />
                        </svg>
                    )
                },
                {
                    id: "minaret",
                    style: {
                        bottom: 0,
                        left: -5,
                        width: 96,
                        height: 128
                    },
                    className: "absolute opacity-90 text-amber-400 animate-glitter",
                    node: (
                        <svg viewBox="0 0 40 80" className="w-full h-full fill-current">
                            <path d="M5,80 L15,80 L15,35 Q10,30 5,35 Z" />
                            <path d="M8,32 L12,32 L10,20 Z" />
                            <path d="M10,5 A4,4 0 1,0 10,13 A3,3 0 1,1 10,5" transform="translate(0, 10)" />
                        </svg>
                    )
                },
                {
                    id: "arabian-shape",
                    style: {
                        bottom: 0,
                        right: -10,
                        width: 128,
                        height: 144
                    },
                    className: "absolute opacity-90 text-amber-500 animate-glitter",
                    node: (
                        <svg viewBox="0 0 60 80" className="w-full h-full fill-current">
                            <path d="M10,80 L40,80 L40,65 Q25,45 10,65 Z" />
                            <path d="M35,80 L42,80 L42,35 Q38,30 35,35 Z" />
                            <path d="M15,10 A8,8 0 1,0 15,26 A6,6 0 1,1 15,10" transform="translate(10, 5) rotate(10)" />
                        </svg>
                    )
                }
            ]
        }
    },
    football: {
        id: "football",
        background: {
            stars: {
                count: 10,
                color: "#ffffff",
                sizeOptions: [1.5, 2, 3],
                opacity: 0.45,
                animationDelayStep: 0.2,
                animationDurationBase: 2,
                animationDurationVariance: 1.5
            },
            elements: [
                {
                    id: "stadium-light-left",
                    style: {
                        top: 12,
                        left: 8,
                        width: 72,
                        height: 72
                    },
                    className: "absolute opacity-85",
                    node: (
                        <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-sky-400">
                            <circle cx="50" cy="50" r="36" fill="currentColor" opacity="0.14" />
                            <circle cx="50" cy="50" r="18" fill="currentColor" opacity="0.24" />
                        </svg>
                    )
                },
                {
                    id: "stadium-light-right",
                    style: {
                        top: 18,
                        right: -6,
                        width: 88,
                        height: 88
                    },
                    className: "absolute opacity-70",
                    node: (
                        <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-cyan-300">
                            <rect x="10" y="20" width="80" height="60" rx="30" fill="currentColor" opacity="0.2" />
                            <circle cx="50" cy="40" r="16" fill="currentColor" opacity="0.32" />
                        </svg>
                    )
                },
                {
                    id: "football-field",
                    style: {
                        bottom: 0,
                        left: 16,
                        width: 120,
                        height: 92
                    },
                    className: "absolute opacity-90 text-emerald-400",
                    node: (
                        <svg viewBox="0 0 120 92" className="w-full h-full fill-current">
                            <rect x="0" y="24" width="120" height="68" rx="24" fill="currentColor" opacity="0.18" />
                            <path d="M20 58c15-24 40-24 60-24s45 0 60 24" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.5" />
                            <circle cx="60" cy="64" r="10" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.65" />
                        </svg>
                    )
                }
            ]
        }
    }
};
