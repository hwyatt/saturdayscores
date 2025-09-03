"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import { Game, ScoreBug } from "./components/scoreBug";
import { TEAMS } from "./api/teams/route";
import { ScrollingMarquee } from "./components/scrollingMarquee";
import { Gamecast } from "./components/gamecast";
import { useSearchParams } from "next/navigation";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const [games, setGames] = useState<Game[]>([]);
  const [fade, setFade] = useState(false);
  const [visibleSetIndex, setVisibleSetIndex] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredFade, setFeaturedFade] = useState(false);
  const teams = TEAMS;
  const gamesRef = useRef<Game[]>([]);
  const [featuredGameIds, setFeaturedGameIds] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const featuredGamesInProgress = games.filter(
    (g) =>
      featuredGameIds.includes(g.id.toString()) && g.status === "in_progress"
  );
  const currentFeatured = featuredGamesInProgress[featuredIndex] || null;
  const canFadeFeatured = featuredGamesInProgress.length > 1;

  useEffect(() => {
    const param = searchParams.get("featuredGames");
    if (param) {
      setFeaturedGameIds(param.split(","));
    }
  }, [searchParams]);

  const GAMES_PER_SET = 9;

  useEffect(() => {
    const ws = new WebSocket(`wss://saturday-stats-ws.onrender.com`);

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log(
          "Received response:",
          JSON.stringify(response.data.scoreboard, null, 2)
        );

        const filteredGames = response.data.scoreboard
          .filter(
            (g: Game) =>
              g.awayClassification === "fbs" || g.homeClassification === "fbs"
          )
          .filter(
            (game: Game, index: number, self: Game[]) =>
              index === self.findIndex((g: Game) => g.id === game.id)
          )
          .sort(
            (a: Game, b: Game) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );

        gamesRef.current = filteredGames;
        setGames(filteredGames);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      const totalSets = Math.ceil(gamesRef.current.length / GAMES_PER_SET);
      if (totalSets <= 1) return;

      setFade(true);

      setTimeout(() => {
        setVisibleSetIndex((prev) => (prev + 1) % totalSets);
        setFade(false);
      }, 500);
    }, 15000);

    return () => clearInterval(cycle);
  }, []);

  useEffect(() => {
    if (featuredGamesInProgress.length <= 1) return; // skip cycling

    const cycleFeatured = setInterval(() => {
      setFeaturedFade(true);

      setTimeout(() => {
        setFeaturedIndex((prev) => {
          const featuredGames = gamesRef.current.filter(
            (g) =>
              featuredGameIds.includes(g.id.toString()) &&
              g.status === "in_progress"
          );

          if (featuredGames.length === 0) return prev;
          return (prev + 1) % featuredGames.length;
        });
        setFeaturedFade(false);
      }, 500);
    }, 33000);

    return () => clearInterval(cycleFeatured);
  }, [featuredGameIds, featuredGamesInProgress.length]);

  const startIndex = visibleSetIndex * GAMES_PER_SET;
  const currentGames = games.slice(startIndex, startIndex + GAMES_PER_SET);

  const shouldFade = games.length > GAMES_PER_SET;

  return (
    <div className="bg-neutral-800 min-h-screen flex p-8 gap-8 relative">
      <div
        className={`w-6/8 flex flex-col justify-start gap-4 transition-opacity duration-500 ${
          canFadeFeatured && featuredFade ? "opacity-0" : "opacity-100"
        }`}
      >
        {currentFeatured && <Gamecast game={currentFeatured} />}
        {currentFeatured && (
          <ScoreBug
            key={currentFeatured.id}
            game={currentFeatured}
            teams={teams}
            isActive
          />
        )}
      </div>
      <div
        className={`flex flex-col gap-4 items-start transition-opacity duration-500 ${
          shouldFade && fade ? "opacity-0" : "opacity-100"
        }`}
      >
        {currentGames.map((game) => (
          <ScoreBug key={game.id} game={game} teams={teams} />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 bg-neutral-200 flex items-center w-full">
        <ScrollingMarquee games={games} />
      </div>
    </div>
  );
}
