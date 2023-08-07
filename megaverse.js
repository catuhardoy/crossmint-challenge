const axios = require("axios");
require("dotenv").config();

const AstralObject = {
  SPACE: "SPACE",
  POLYANET: "POLYANET",
  COMETH: "COMETH",
  SOLOON: "SOLOON",
};

const ComethDirection = {
  RIGHT: "right",
  LEFT: "left",
  UP: "up",
  DOWN: "down",
};

const SoloonColor = {
  BLUE: "blue",
  RED: "red",
  WHITE: "white",
  PURPLE: "purple",
};

const setAstralObjects = async (cell, astralObjectType) => {
  const astralObjectUrl = `${process.env.BASE_API_URL}${astralObjectType.toLowerCase()}s`;
  let postObject = { row: cell.row, column: cell.column, candidateId: process.env.CANDIDATE_ID };

  if (astralObjectType.includes(AstralObject.COMETH)) {
    postObject.direction = cell.direction;
  }

  if (astralObjectType.includes(AstralObject.SOLOON)) {
    postObject.color = cell.color;
  }

  try {
    const response = await axios.post(astralObjectUrl, postObject);
    console.log("Posted: ", postObject);
  } catch (error) {
    console.log("Error: ", error.message);
  }
};


const setRow = (goalRow, rowNum) => {
  let polyanets = [];
  let soloons = [];
  let comeths = [];

  goalRow.forEach((astralObject, i) => {
    if (astralObject === AstralObject.POLYANET) {
      polyanets.push({ row: rowNum, column: i });
    } else if (astralObject.includes(AstralObject.COMETH)) {
      let cometh = {
        row: rowNum,
        column: i,
        direction: astralObject.split("_")[0].toLowerCase(),
      };
      comeths.push(cometh);
    } else if (astralObject.includes(AstralObject.SOLOON)) {
      let soloon = {
        row: rowNum,
        column: i,
        color: astralObject.split("_")[0].toLowerCase(),
      };
      soloons.push(soloon);
    }
  });

  return {
    polyanets,
    soloons,
    comeths,
  };
};

const setGoalMap = async (goalMap) => {
  let polyanets = [];
  let soloons = [];
  let comeths = [];

  goalMap.goal.forEach((goalRow, i) => {
    const cellGroup = setRow(goalRow, i);
    polyanets.push(...cellGroup.polyanets);
    soloons.push(...cellGroup.soloons);
    comeths.push(...cellGroup.comeths);
  });

  for (const polyanet of polyanets) {
    await setAstralObjects(polyanet, AstralObject.POLYANET);
    await sleep(500); // Esperar 500 ms antes de la próxima solicitud
  }

  for (const soloon of soloons) {
    await setAstralObjects(soloon, AstralObject.SOLOON);
    await sleep(500); // Esperar 500 ms antes de la próxima solicitud
  }

  for (const cometh of comeths) {
    await setAstralObjects(cometh, AstralObject.COMETH);
    await sleep(500); // Esperar 500 ms antes de la próxima solicitud
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const fetchGoalMap = async () => {
  try {
    const fetchGoalUrl = `${process.env.BASE_API_URL}map/${process.env.CANDIDATE_ID}/goal`;
    const goalRes = await axios.get(fetchGoalUrl);
    const fetchedGoalMap = goalRes.data;
    return fetchedGoalMap;
  } catch (err) {
    console.log("ERROR:", err.message);
    return { goal: [] };
  }
};

const fetchAndSetGoalMap = async () => {
  const goalMap = await fetchGoalMap();
  if (goalMap.goal.length) {
    setGoalMap(goalMap);
  }
};

fetchAndSetGoalMap();
