const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const dpPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndSever = async () => {
  try {
    db = await open({
      filename: dpPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndSever();

//get players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team;
    `;
  const dbRequest = await db.all(getPlayersQuery);
  response.send(dbRequest);
});

// post players API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerQuery = `
  INSERT INTO cricket_team (player_name, jersey_number, role) 
  VALUES(
     '${playerName}',
     ${jerseyNumber},
     '${role}'
  );
`;

  const dbRequest = await db.run(createPlayerQuery);
  const playerId = dbRequest.lastID;
  response.send("Player added to team");
});

//GET specific player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id=${playerId};
    `;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

//Update a player API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
    UPDATE cricket_team SET 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    WHERE player_id=${playerId};
    `;

  const dvRequest = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete a player API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deleteQuery = `
     DELETE FROM cricket_team WHERE player_id=${playerId};
     `;
  const dbRequest = await db.get(deleteQuery);
  response.send("Player Removed");
});
