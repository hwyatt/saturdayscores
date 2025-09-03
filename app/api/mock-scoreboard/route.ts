import { NextResponse } from "next/server";
import { TEAMS } from "../teams/route";

const statusPool = [
  { status: "in_progress", currentPeriod: 1, currentClock: "12:34" },
  { status: "in_progress", currentPeriod: 2, currentClock: "00:00:00" },
  { status: "in_progress", currentPeriod: 3, currentClock: "08:47" },
  { status: "in_progress", currentPeriod: 4, currentClock: "01:12" },
  { status: "completed", currentPeriod: 4, currentClock: "00:00" },
];

export async function GET() {
  const totalMatchups = Math.floor(TEAMS.length / 2);
const mockedGames = Array.from({ length: totalMatchups }).map((_, i) => {
  const teamA = TEAMS[i * 2];
  const teamB = TEAMS[i * 2 + 1];
  const statusState = statusPool[i % statusPool.length];


    return {
      id: String(3000 + i),
      awayId: 100 + i,
      homeId: 200 + i,
      awayTeam: `${teamA.school} ${teamA.mascot}`,
      homeTeam: `${teamB.school} ${teamB.mascot}`,
      awayPoints: Math.floor(Math.random() * 40),
      homePoints: Math.floor(Math.random() * 40),
      awayConference: teamA.conference,
      homeConference: teamB.conference,
      awayConferenceAbbreviation: teamA.abbreviation,
      homeConferenceAbbreviation: teamB.abbreviation,
      currentClock: statusState.currentClock,
      currentPeriod: statusState.currentPeriod,
      currentPossession: "away",
      currentSituation: `1st & 10 at ${teamB.abbreviation} ${Math.floor(
        Math.random() * 50 + 1
      )}`,
      status: statusState.status,
      lastPlay: `${teamA.school} pass complete to ${
        Math.floor(Math.random() * 50) + 1
      }-yard line`,
      tv: "ESPN",
      venue: "Generic Stadium",
      city: "Atlanta",
      state: "GA",
      startDate: new Date().toISOString(),
      startTimeTbd: false,
      temperature: 70 + Math.floor(Math.random() * 10),
      windSpeed: 5,
      windDirection: 180,
      weatherDescription: "Partly Cloudy",
      neutralSite: false,
      spread: -3.5,
      overUnder: 52.5,
      moneylineAway: 140,
      moneylineHome: -120,
      awayLineScores: [7, 3, 10, 0],
      homeLineScores: [0, 14, 7, 3],
      awayClassification: "FBS",
      homeClassification: "FBS",
      conferenceGame: Math.random() > 0.5,
    };
  });

  // Hardcoded Alabama vs Georgia game
  const alabama = TEAMS.find((t) => t.school === "Alabama");
  const georgia = TEAMS.find((t) => t.school === "Georgia");
  const statusState = statusPool[0];

  const featuredGame = {
    id: "401628374",
    awayId: 9991,
    homeId: 9992,
    awayTeam: `${georgia?.school} ${georgia?.mascot}`,
    homeTeam: `${alabama?.school} ${alabama?.mascot}`,
    awayPoints: 17,
    homePoints: 24,
    awayConference: georgia?.conference,
    homeConference: alabama?.conference,
    awayConferenceAbbreviation: georgia?.abbreviation,
    homeConferenceAbbreviation: alabama?.abbreviation,
    currentClock: statusState.currentClock,
    currentPeriod: statusState.currentPeriod,
    currentPossession: "away",
    currentSituation: `2nd & 7 at BAMA 35`,
    status: statusState.status,
    lastPlay: "Bennett pass complete to McConkey for 5 yards",
    tv: "ESPN",
    venue: "Bryant–Denny Stadium",
    city: "Tuscaloosa",
    state: "AL",
    startDate: new Date().toISOString(),
    startTimeTbd: false,
    temperature: 78,
    windSpeed: 5,
    windDirection: 180,
    weatherDescription: "Partly Cloudy",
    neutralSite: false,
    spread: -3.5,
    overUnder: 52.5,
    moneylineAway: 140,
    moneylineHome: -120,
    awayLineScores: [7, 3, 7, 0],
    homeLineScores: [10, 7, 7, 0],
    awayClassification: "FBS",
    homeClassification: "FBS",
    conferenceGame: true,
  };

  return NextResponse.json(
    {
      data: {
        scoreboard: [featuredGame, ...mockedGames],
      },
    },
    { status: 200 }
  );
}
