// Sample squad used in demo mode (when the app runs without json-server).
// [name, shirt number, date of birth, height cm, weight kg, position, nationality, foot]
const PLAYERS = [
  ["Daniel Mwangi", 1, "1996-03-12", 190, 84, "Goalkeeper", "Kenyan", "Right"],
  ["Lukas Brandt", 13, "2001-08-30", 187, 80, "Goalkeeper", "German", "Left"],
  ["Samuel Otieno", 2, "1997-05-21", 178, 74, "Defender", "Kenyan", "Right"],
  ["Marco Bellini", 3, "1995-11-02", 182, 78, "Defender", "Italian", "Left"],
  ["Tom Hargreaves", 4, "1998-01-15", 188, 82, "Defender", "English", "Right"],
  ["Jean Dupont", 5, "1999-07-09", 185, 79, "Defender", "French", "Right"],
  ["Peter Kamau", 15, "2000-04-18", 180, 75, "Defender", "Kenyan", "Left"],
  ["Ahmed Hassan", 16, "2002-09-27", 183, 77, "Defender", "Egyptian", "Right"],
  ["Carlos Mendes", 6, "1996-02-25", 176, 72, "Midfielder", "Portuguese", "Right"],
  ["Ivan Petrov", 8, "1994-10-11", 181, 76, "Midfielder", "Bulgarian", "Both"],
  ["Kevin Njoroge", 10, "1999-12-05", 172, 68, "Midfielder", "Kenyan", "Left"],
  ["Oliver Smith", 14, "2003-02-20", 175, 70, "Midfielder", "Scottish", "Both"],
  ["Mateo Silva", 18, "2001-06-14", 177, 71, "Midfielder", "Brazilian", "Right"],
  ["David Okello", 20, "2004-03-08", 174, 69, "Midfielder", "Ugandan", "Right"],
  ["Harry Johnstone", 7, "1994-06-16", 176, 76, "Forward", "English", "Left"],
  ["Emmanuel Kiptoo", 9, "1998-09-03", 184, 80, "Forward", "Kenyan", "Right"],
  ["Rafael Costa", 11, "2000-11-22", 179, 73, "Forward", "Spanish", "Left"],
  ["Noah Becker", 17, "2002-05-06", 181, 75, "Forward", "German", "Right"],
];

export const SEED = {
  players: PLAYERS.map(([name, shirtNumber, dob, height, weight, position, nationality, preferredFoot], i) => ({
    id: i + 1,
    name,
    shirtNumber,
    dob,
    height,
    weight,
    position,
    nationality,
    preferredFoot,
  })),
  injuries: [],
  matches: [],
  performances: [],
  squads: [],
  users: [],
};
