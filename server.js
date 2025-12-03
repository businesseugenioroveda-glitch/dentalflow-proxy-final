import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*", methods: ["POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json({ limit: "25mb" }));

app.post("/upload", async (req, res) => {
  try {
    const { fileContent, fileName, folder } = req.body;
    if (!fileContent || !fileName || !folder) throw new Error("Missing data");

    // --- CONFIGURAZIONE INFOMANIAK ---
    const AUTH = "Basic " + Buffer.from("PCU-MAWH6JC:Vezzagay1!").toString("base64");
    const PROJECT_ID = "e395004b8a984c6aa4ad4c5657a2d21f";
    const CONTAINER = "dentalsuite-files-test";
    const REGION = "dc4";

    // --- 1. Ottieni token temporaneo ---
    const tokenRes = await fetch(`https://api.infomaniak.com/1/storage/${PROJECT_ID}/token`, {
      headers: { Authorization: AUTH },
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access;
    if (!token) throw new Error("Token fetch failed");

    // --- 2. Carica il file ---
    const uploadURL = `https://object.${REGION}.pub1.infomaniak.cloud/v1/AUTH_${PROJECT_ID}/${CONTAINER}/${folder}/${fileName}`;
    const upload = await fetch(uploadURL, {
      method: "PUT",
      headers: {
        "X-Auth-Token": token,
        "Content-Type": "application/octet-stream",
      },
      body: Buffer.from(fileContent, "base64"),
    });

    if (!upload.ok) throw new Error(`Upload failed: ${upload.status}`);

    res.json({ message: "File caricato con successo ✅", url: uploadURL });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(8080, () => console.log("✅ DentalFlow Proxy attivo su porta 8080"));

