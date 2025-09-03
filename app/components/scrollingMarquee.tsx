import Marquee from "react-fast-marquee";
import { Game } from "./scoreBug";
import { formatClock } from "./scoreBug";

type MarqueeProps = {
  games: Game[];
};

export const ScrollingMarquee = ({ games }: MarqueeProps) => {
  return (
    <Marquee
      className="bg-neutral-900 text-white text-lg font-semibold py-4 flex-grow gap-16"
      speed={60}
    >
      {games.map((game: Game, index: number) => {
        const periodMap: Record<number, string> = {
          1: "1st",
          2: "2nd",
          3: "3rd",
          4: "4th",
        };
        const quarter =
          periodMap[Number(game.currentPeriod)] || `${game.currentPeriod}`;

        return (
          // TODO: may need min-width to prevent jumping
          <div key={index} className="flex items-center">
            <div className="flex items">
              <div className="mx-8 flex flex-col">
                <div className="flex gap-8 justify-between">
                  <span
                    className={`font-semibold ${
                      game.status === "completed" &&
                      game.awayPoints > game.homePoints
                        ? "text-yellow-400"
                        : ""
                    }`}
                  >
                    {game.awayTeam}
                  </span>
                  <span
                    className={`font-bold ${
                      game.status === "completed" &&
                      game.awayPoints > game.homePoints
                        ? "text-yellow-400"
                        : ""
                    }`}
                  >
                    {game.awayPoints}
                  </span>
                </div>
                <div className="flex gap-8 justify-between">
                  <span
                    className={`font-semibold ${
                      game.status === "completed" &&
                      game.homePoints > game.awayPoints
                        ? "text-yellow-400"
                        : ""
                    }`}
                  >
                    {game.homeTeam}
                  </span>
                  <span
                    className={`font-bold ${
                      game.status === "completed" &&
                      game.homePoints > game.awayPoints
                        ? "text-yellow-400"
                        : ""
                    }`}
                  >
                    {game.homePoints}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                {game.status === "completed" ? (
                  <span>Final</span>
                ) : game.status === "scheduled" ? (
                  <>
                    <span className="">
                      {new Date(game.startDate).toLocaleString("en-US", {
                        timeZone: "America/New_York",
                        ...(new Date(game.startDate).toDateString() !==
                        new Date().toDateString()
                          ? { weekday: "short" } // only show weekday if not today
                          : {}),
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                    {game.tv && <span>{game.tv}</span>}
                  </>
                ) : game.currentPeriod === 2 &&
                  game.currentClock === "00:00:00" ? (
                  <span>Halftime</span>
                ) : (
                  <>
                    <span>{quarter}</span>
                    <span>{formatClock(game.currentClock)}</span>
                  </>
                )}
              </div>
            </div>
            <span className="text-neutral-600 text-4xl ml-8">|</span>
          </div>
        );
      })}
    </Marquee>
  );
};
