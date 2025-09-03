import tinycolor from "tinycolor2";
import { findMatchingTeam, getTeamInfo } from "../utils/findMatchingTeam";
import Image from "next/image";
import { useSpring, animated } from "@react-spring/web";
import { useRef } from "react";

export function formatClock(clock: string) {
  // clock comes in as "HH:MM:SS"
  const [hours, minutes, seconds] = clock.split(":").map(Number);

  // Total minutes = hours * 60 + minutes
  const totalMinutes = hours * 60 + minutes;

  // Pad seconds to always be 2 digits
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${totalMinutes}:${paddedSeconds}`;
}

type ScoreSpringProps = {
  value: number;
};

export const ScoreSpring = ({ value }: ScoreSpringProps) => {
  const previous = useRef(value);

  const spring = useSpring({
    from: { number: previous.current },
    to: { number: value },
    config: { mass: 1, tension: 250, friction: 18 },
    onRest: () => {
      previous.current = value;
    },
  });

  return (
    <animated.div className="text-4xl font-bold leading-none">
      {spring.number.to((n) => n.toFixed(0))}
    </animated.div>
  );
};

export type Game = {
  awayClassification: string;
  awayConference: string;
  awayConferenceAbbreviation: string;
  awayId: number;
  awayLineScores: number[];
  awayPoints: number;
  awayTeam: string;
  city: string;
  conferenceGame: boolean;
  currentClock: string;
  currentPeriod: number;
  currentPossession: string;
  currentSituation: string;
  homeClassification: string;
  homeConference: string;
  homeConferenceAbbreviation: string;
  homeId: number;
  homeLineScores: number[];
  homePoints: number;
  homeTeam: string;
  id: string;
  lastPlay: string;
  moneylineAway: number;
  moneylineHome: number;
  neutralSite: boolean;
  overUnder: number;
  spread: number;
  startDate: string;
  startTimeTbd: boolean;
  state: string;
  status: string;
  temperature: number;
  tv: string;
  venue: string;
  weatherDescription: string;
  windDirection: number;
  windSpeed: number;
};

export type Team = {
  id: number;
  school: string;
  mascot: string | null;
  color: string;
  logos: string[] | null;
  abbreviation: string | null;
};

type ScoreBugProps = {
  game: Game;
  teams: Team[];
  isActive?: boolean;
};

export const ScoreBug = ({ game, teams, isActive = false }: ScoreBugProps) => {
  const {
    awayTeam,
    awayPoints,
    homeTeam,
    homePoints,
    currentClock,
    currentPeriod,
    currentPossession,
    currentSituation,
    status,
    startDate,
  } = game;

  const matchingHomeTeam = findMatchingTeam(homeTeam, teams);
  const matchingAwayTeam = findMatchingTeam(awayTeam, teams);
  const homeInfo = getTeamInfo(homeTeam, teams);
  const awayInfo = getTeamInfo(awayTeam, teams);

  // const yardLine = currentSituation?.split("at")?.[1]?.trim() || "--";
  const periodMap: Record<number, string> = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
  };
  const quarter = periodMap[currentPeriod] || `${currentPeriod}`;

  return (
    <div
      className={`rounded-lg w-full overflow-hidden shadow-2xl flex text-white relative bg-black h-20`}
    >
      {/* Home Logo */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 overflow-hidden">
        <Image
          src={matchingHomeTeam?.logos?.[0] ?? "/icon.png"}
          alt={`${homeTeam} Logo`}
          width={112}
          height={112}
          className="object-contain -translate-x-4"
        />
      </div>

      {/* Home Team Info */}
      <div
        className="flex flex-col items-end justify-center pr-4 pl-20 flex-1 h-full relative z-0"
        style={{ backgroundColor: matchingHomeTeam?.color }}
      >
        {isActive && (
          <>
            <span className="font-bold text-xl leading-tight">
              {homeInfo.school.toUpperCase()}
            </span>
            <span className="leading-tight">{homeInfo.mascot}</span>
          </>
        )}
      </div>

      {/* Home Score */}
      <div
        className="relative flex items-center justify-center px-4 text-4xl font-bold h-full w-24"
        style={{
          backgroundColor: tinycolor(matchingHomeTeam?.color)
            .darken(10)
            .toString(),
        }}
      >
        <ScoreSpring value={homePoints || 0} />
        {currentPossession === "home" && status !== "completed" && (
          <div className="absolute bottom-2 left-2 right-2 h-1 bg-white rounded shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"></div>
        )}
      </div>

      {/* Middle Info */}
      <div
        className={`min-w-44 bg-gray-200 text-gray-700 ${
          isActive ? "basis-1/6" : "basis-1/5"
        } flex flex-col items-center justify-evenly h-full py-1 px-2`}
      >
        {status === "scheduled" ? (
          <div className="flex items-center justify-center h-full">
            <span className="font-bold text-xl">
              {new Date(startDate).toLocaleString("en-US", {
                timeZone: "America/New_York",
                ...(new Date(startDate).toDateString() !==
                new Date().toDateString()
                  ? { weekday: "short" } // only show weekday if not today
                  : {}),
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        ) : currentPeriod === 2 && currentClock === "00:00:00" ? (
          <div className="flex items-center justify-center h-full">
            <span className="font-bold uppercase text-2xl">Half</span>
          </div>
        ) : status === "completed" ? (
          <div className="flex items-center justify-center h-full">
            <span className="font-bold uppercase text-2xl">Final</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className={`${isActive ? "text-2xl" : "text-lg"}`}>
                {quarter}
              </span>
              <span className="text-gray-400">|</span>
              <span
                className={`${isActive ? "text-3xl" : "text-2xl"} font-bold`}
              >
                {formatClock(currentClock)}
              </span>
            </div>
            <div
              className={`bg-red-950 text-white px-2 py-1 rounded-full font-bold ${
                isActive ? "" : "text-sm"
              }`}
              style={{
                backgroundColor:
                  currentPossession === "home"
                    ? matchingHomeTeam?.color ?? "#000"
                    : currentPossession === "away"
                    ? matchingAwayTeam?.color ?? "#000"
                    : "#000",
              }}
            >
              {currentSituation?.includes("at")
                ? currentSituation.split("at")[0]
                : "1st & 10"}
            </div>
          </>
        )}
      </div>

      {/* Away Score */}
      <div
        className="relative flex items-center justify-center px-4 text-4xl font-bold h-full w-24"
        style={{
          backgroundColor: tinycolor(matchingAwayTeam?.color)
            .darken(10)
            .toString(),
        }}
      >
        <ScoreSpring value={awayPoints || 0} />
        {currentPossession === "away" && status !== "completed" && (
          <div className="absolute bottom-2 left-2 right-2 h-1 bg-white rounded shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"></div>
        )}
      </div>

      {/* Away Team Info */}
      <div
        className="flex flex-col items-start justify-center pl-4 pr-20 flex-1 h-full relative z-0"
        style={{ backgroundColor: matchingAwayTeam?.color }}
      >
        {isActive && (
          <>
            <span className="font-bold text-xl leading-tight">
              {awayInfo.school.toUpperCase()}
            </span>
            <span className="leading-tight">{awayInfo.mascot}</span>
          </>
        )}
      </div>

      {/* Away Logo */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 overflow-hidden">
        <Image
          src={matchingAwayTeam?.logos?.[0] ?? "/icon.png"}
          alt={`${awayTeam} Logo`}
          width={112}
          height={112}
          className="object-contain translate-x-4"
        />
      </div>
    </div>
  );
};
