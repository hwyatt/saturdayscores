"use client";
import Image from "next/image";

function parseLocation(
  situation: string | null | undefined,
  currentPossession: string,
  homeTeamAbbr: string,
  awayTeamAbbr: string
): { teamAbbr: string; yardLine: number; firstDownLine: number } | null {
  if (!situation || !currentPossession) return null;

  const standardRegex =
    /(\d)(?:st|nd|rd|th)\s&\s(\d+)\s(?:at|on)\s([A-Z-]{2,5})\s(\d{1,2})/i;

  const goalRegex =
    /(\d)(?:st|nd|rd|th)\s&\sGoal\s(?:at|on)\s([A-Z-]{2,5})\s(\d{1,2})/i;

  const calculateFirstDownLine = (
    yardLine: number,
    toGo: number,
    possession: string,
    teamAbbr: string
  ) => {
    const teamIsPossessing =
      (possession === "home" && teamAbbr === homeTeamAbbr) ||
      (possession === "away" && teamAbbr === awayTeamAbbr);

    return teamIsPossessing ? yardLine + toGo : yardLine - toGo;
  };

  const goalMatch = situation.match(goalRegex);
  if (goalMatch) {
    const teamAbbr = goalMatch[2].toUpperCase();
    const yardLine = parseInt(goalMatch[3], 10);
    const toGo = yardLine;
    const firstDownLine = calculateFirstDownLine(
      yardLine,
      toGo,
      currentPossession,
      teamAbbr
    );

    return { teamAbbr, yardLine, firstDownLine };
  }

  const standardMatch = situation.match(standardRegex);
  if (standardMatch) {
    const toGo = parseInt(standardMatch[2], 10);
    const teamAbbr = standardMatch[3].toUpperCase();
    const yardLine = parseInt(standardMatch[4], 10);
    const firstDownLine = calculateFirstDownLine(
      yardLine,
      toGo,
      currentPossession,
      teamAbbr
    );

    return { teamAbbr, yardLine, firstDownLine };
  }

  return null;
}

function getLeftPositionPercent(
  teamAbbr: string,
  yardLine: number,
  homeTeamAbbr: string,
  awayTeamAbbr: string
): number {
  const fieldStartPercent = 100 / 12;
  const yardWidthPercent = (100 * 10) / 12 / 100;
  const visualOffset = 1.5;

  if (teamAbbr === awayTeamAbbr) {
    return fieldStartPercent + (yardLine + visualOffset) * yardWidthPercent;
  } else if (teamAbbr === homeTeamAbbr) {
    return (
      fieldStartPercent + (100 - yardLine - visualOffset) * yardWidthPercent
    );
  }

  return 50;
}

export interface TeamData {
  school: string;
  color: string;
  logo: string;
  abbr: string;
}

export interface PlayData {
  currentSituation: string | null;
  lastPlay: string;
  currentPossession: string;
}

interface GamecastFieldProps {
  homeTeam: TeamData;
  awayTeam: TeamData;
  currentSituation: string | null;
  lastPlay: string | null;
  currentPossession: string;
  currentClock?: string;
  currentPeriod?: number;
}

export const GamecastField: React.FC<GamecastFieldProps> = ({
  homeTeam,
  awayTeam,
  currentSituation,
  currentPossession,
  currentClock,
  currentPeriod,
  lastPlay,
}) => {
  const adjustedPossession = (() => {
    if (!lastPlay) return currentPossession;

    const play = lastPlay.toLowerCase();
    if (play.includes("punt") || play.includes("kickoff")) {
      return currentPossession === "home" ? "away" : "home";
    }
    return currentPossession;
  })();

  const location = parseLocation(
    currentSituation,
    adjustedPossession,
    homeTeam.abbr,
    awayTeam.abbr
  );

  const leftPercent = location
    ? getLeftPositionPercent(
        location.teamAbbr,
        location.yardLine,
        homeTeam.abbr,
        awayTeam.abbr
      )
    : 50; // default middle if can't parse

  let positionStyle: React.CSSProperties = {};

  if (currentSituation?.toLowerCase().includes("& goal")) {
    if (adjustedPossession === "home") {
      positionStyle = { left: "85px" };
    } else if (adjustedPossession === "away") {
      positionStyle = { right: "85px" };
    }
  } else {
    const leftPercent = location
      ? getLeftPositionPercent(
          location.teamAbbr,
          location.firstDownLine,
          homeTeam.abbr,
          awayTeam.abbr
        )
      : 50;

    positionStyle = { left: `${leftPercent}%` };
  }

  const possessionTeam =
    adjustedPossession === "home"
      ? homeTeam
      : adjustedPossession === "away"
      ? awayTeam
      : null;

  const isHalftime = currentClock === "00:00:00" && currentPeriod === 2;

  const isTouchdown = (() => {
    const tdKeywords = ["touchdown", "td", "extra point", "kick)"];

    const checkString = (str?: string | null) =>
      !!str && tdKeywords.some((kw) => str.toLowerCase().includes(kw));

    return checkString(currentSituation) || checkString(lastPlay);
  })();

  const isFieldGoal = (() => {
    const fgKeywords = ["fg good", "field goal good"];

    const checkString = (str?: string | null) =>
      !!str && fgKeywords.some((kw) => str.toLowerCase().includes(kw));

    return checkString(currentSituation) || checkString(lastPlay);
  })();

  const shouldShowMarkers =
    !isHalftime &&
    currentSituation &&
    currentSituation.trim() !== "" &&
    !isTouchdown &&
    !isFieldGoal;

  return (
    <div className="w-full flex justify-center items-center">
      <div
        className="w-[90%] max-w-[1000px] h-[400px] relative"
        style={{ perspective: "1200px" }}
      >
        {/* Field */}
        <div
          className="w-full h-full grid grid-cols-12 gap-0 rounded-lg border-b-12 border-green-900 shadow-2xl"
          style={{
            background: "linear-gradient(to right, #1e7a1e, #2ca52c)",
            transform: "rotateX(60deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Away Endzone */}
          <div
            className="flex items-center justify-center text-white text-5xl font-bold rotate-180 uppercase"
            style={{ backgroundColor: awayTeam.color }}
          >
            <span className="rotate-90 whitespace-nowrap">
              {awayTeam.school.length > 12 ? awayTeam.abbr : awayTeam.school}
            </span>
          </div>

          {/* 10-yard segments */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="opacity-25 border-l border-r border-white flex items-end justify-center text-white text-xs pb-2"
            ></div>
          ))}

          {/* Home Endzone */}
          <div
            className="flex items-center justify-center text-white uppercase text-5xl font-bold"
            style={{ backgroundColor: homeTeam.color }}
          >
            <span className="rotate-90 whitespace-nowrap">
              {homeTeam.school.length > 12 ? homeTeam.abbr : homeTeam.school}
            </span>
          </div>

          {/* Centered home team logo */}
          <div
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              width: 120,
              height: 120,
            }}
          >
            <Image
              src={homeTeam.logo}
              alt={`${homeTeam.abbr} logo`}
              width={120}
              height={120}
              style={{ objectFit: "contain" }}
              priority={true}
            />
          </div>

          {isHalftime && (
            <div
              className="absolute text-3xl bg-neutral-200 font-bold text-neutral-800 rounded-lg p-4"
              style={{
                top: "10%",
                left: "50%",
                zIndex: 30,
                transform:
                  "translate(-50%, -50%) rotateX(-60deg) translateZ(150px)",
                transformOrigin: "center center",
              }}
            >
              Halftime
            </div>
          )}

          {isTouchdown && (
            <div
              className="absolute flex items-center gap-2 text-3xl font-bold text-white rounded-lg p-4 animate-touchdown"
              style={{
                top: "10%",
                left: "50%",
                zIndex: 30,
                transform:
                  "translate(-50%, -50%) rotateX(-60deg) translateZ(150px)",
                transformOrigin: "center center",
                backgroundColor: possessionTeam?.color,
              }}
            >
              {possessionTeam?.logo && (
                <Image
                  src={possessionTeam.logo}
                  alt={`${possessionTeam.school} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )}
              <span>Touchdown {possessionTeam?.abbr}</span>
              {possessionTeam?.logo && (
                <Image
                  src={possessionTeam.logo}
                  alt={`${possessionTeam.school} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )}
            </div>
          )}

          {isFieldGoal && (
            <div
              className="absolute flex items-center gap-2 text-3xl font-bold text-white rounded-lg p-4 animate-touchdown"
              style={{
                top: "10%",
                left: "50%",
                zIndex: 30,
                transform:
                  "translate(-50%, -50%) rotateX(-60deg) translateZ(150px)",
                transformOrigin: "center center",
                backgroundColor: possessionTeam?.color,
              }}
            >
              {possessionTeam?.logo && (
                <Image
                  src={possessionTeam.logo}
                  alt={`${possessionTeam.school} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )}
              <span>Field Goal {possessionTeam?.abbr}</span>
              {possessionTeam?.logo && (
                <Image
                  src={possessionTeam.logo}
                  alt={`${possessionTeam.school} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )}
            </div>
          )}
        </div>

        {/* First down line outside rotated div */}
        {shouldShowMarkers && location && (
          <div
            className="absolute h-full"
            style={{
              ...positionStyle,
              width: 3,
              backgroundColor: "yellow",
              top: 0,
              transform: "translateX(-50%) rotateX(60deg)",
              transformStyle: "preserve-3d",
              boxShadow: "0 0 8px 2px yellow",
              zIndex: 15,
              pointerEvents: "none",
              transition: "left 2.5s ease-in-out",
            }}
          />
        )}

        {/* Map Pin */}
        {shouldShowMarkers && possessionTeam && (
          <div
            className="absolute flex flex-col items-center"
            style={{
              top: "100px",
              left: `${leftPercent}%`,
              transform: "translateX(-50%)",
              zIndex: 20,
              transition: "left 2.5s ease-in-out",
            }}
          >
            <div
              className="rounded-full overflow-hidden shadow-xl"
              style={{
                width: 56,
                height: 56,
                backgroundColor: possessionTeam.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={possessionTeam.logo}
                alt={`${possessionTeam.abbr} possession`}
                width={40}
                height={40}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderTop: `18px solid ${possessionTeam.color}`,
                marginTop: "-3px",
              }}
            />
          </div>
        )}

        {/* Yardage and Team Labels Below Field */}
        <div className="-mt-16 flex justify-between text-2xl text-neutral-300 font-semibold">
          <div className="w-[9.25%] text-left">{awayTeam.abbr}</div>
          <div className="w-[24%] text-center">20</div>
          <div className="w-[38%] text-center">50</div>
          <div className="w-[25%] text-center">20</div>
          <div className="w-[8.33%] text-right">{homeTeam.abbr}</div>
        </div>
      </div>
    </div>
  );
};
