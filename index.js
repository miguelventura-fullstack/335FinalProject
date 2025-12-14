require("dotenv").config({ silent: true });
const express = require("express");
const { readFileSync } = require("fs");
const path = require("path");

// const fetch = require("node-fetch");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const PORT = process.argv[2] || 4000;

app.listen(PORT);
process.stdout.write(`Server is running on port ${PORT}\n`);

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/** make the style sheet global */
app.get("/styles.css", (req, res) => {
  res.sendFile(path.resolve(__dirname, "templates", "styles.css"));
});

const uri = process.env.MONGODB_CONNECTION_STRING;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/flights/location", async (req, res) => {
  const { lat, lon, radius } = req.query;
  if (!lat || !lon) {
    return res
      .status(400)
      .json({ error: "lat and lon query parameters are required" });
  }
  try {
    const response = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${
        process.env.AVIATION_API_KEY
      }&lat=${lat}&lon=${lon}${radius ? `&radius=${radius}` : ""}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch flights", details: err.message });
  }
});

app.get("/flights/airport", async (req, res) => {
  const { iata } = req.query;
  if (!iata) {
    return res.status(400).json({ error: "iata query parameter is required" });
  }
  try {
    const response = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATION_API_KEY}&dep_iata=${iata}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch flights", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.render("home");
});
