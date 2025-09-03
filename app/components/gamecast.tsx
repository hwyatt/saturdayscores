import { TEAMS } from "../api/teams/route";
import { GamecastField } from "./gamecastField";
import { findMatchingTeam } from "../utils/findMatchingTeam";
import { Game } from "./scoreBug";
import { get } from "http";

function getPlayType(lastPlay?: string | null): string {
  if (!lastPlay) return "Unknown Play";

  const play = lastPlay.toLowerCase();

  if (play.includes("touchdown") || play.includes("td")) return "Touchdown";
  if (play.includes("punt")) return "Punt";
  if (play.includes("kickoff")) return "Kickoff";
  if (play.includes("field goal")) return "Field Goal";
  if (play.includes("pass incomplete")) return "Incomplete Pass";
  if (play.includes("pass to")) return "Pass Complete";
  if (play.includes("run for") || play.includes("rush")) return "Run";
  if (play.includes("sack")) return "Sack";
  if (play.includes("interception")) return "Interception";
  if (play.includes("fumble")) return "Fumble";

  return "Last Play";
}

type GamecastProps = {
  game: Game;
};

export const Gamecast = ({ game }: GamecastProps) => {
  const {
    awayTeam,
    homeTeam,
    currentPossession,
    currentSituation,
    lastPlay,
    currentClock,
    currentPeriod,
  } = game;

  const teams = TEAMS;

  const matchingHomeTeam = findMatchingTeam(homeTeam, teams);
  const matchingAwayTeam = findMatchingTeam(awayTeam, teams);
  const [down, ballOn] = currentSituation?.split(" at ") ?? ["---", "---"];

  return (
    <div className="flex flex-col bg-neutral-900 rounded-lg p-8 gap-8 aspect-video text-2xl">
      <div className="flex justify-center gap-8 text-white font-bold border-b border-neutral-800 pb-8">
        <div className="text-center pr-8 border-r border-neutral-800">
          <span className="text-neutral-400 block">DOWN</span>
          <span>{down}</span>
        </div>
        <div className="text-center pr-8">
          <span className="text-neutral-400 block">BALL ON</span>
          <span>{ballOn}</span>
        </div>
        {/* <div className="text-center">
          <span className="text-neutral-400 block">DRIVE:</span>
          <span>---</span>
        </div> */}
      </div>
      <GamecastField
        homeTeam={{
          school: matchingHomeTeam?.school || "",
          color: matchingHomeTeam?.color || "",
          abbr: matchingHomeTeam?.abbreviation || "",
          logo: matchingHomeTeam?.logos[0] || "",
        }}
        awayTeam={{
          school: matchingAwayTeam?.school || "",
          color: matchingAwayTeam?.color || "",
          abbr: matchingAwayTeam?.abbreviation || "",
          logo: matchingAwayTeam?.logos[0] || "",
        }}
        lastPlay={lastPlay}
        currentSituation={currentSituation}
        currentPossession={currentPossession}
        currentClock={currentClock}
        currentPeriod={currentPeriod}
      />
      <div className="font-bold text-white border-t border-neutral-800 pt-8">
        <span className="text-neutral-400 block uppercase">
          {getPlayType(lastPlay)}
        </span>
        <span>{lastPlay}</span>
      </div>
    </div>
  );
};
