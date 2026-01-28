import express from "express";
import axios from "axios";

const app = express();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCyqLnnYDTUesIditYQFeHKwvdLwJLtJIc';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

// Endpoint GET para consulta IA
app.get('/exam2p_query_audit', async (req, res) => {
  try {
    const userQuestion = req.query.question || "¿Qué eliminó el usuario admin@test.com?";
    const limit = req.query.limit ? `?limit=${req.query.limit}` : '';
    // Consulta auditoría con limit opcional
    const auditRes = await axios.get(`http://localhost:3000/exam2p-audit${limit}`);
    const auditData = JSON.stringify(auditRes.data.data, null, 2);
    // Prompt para Gemini
    const prompt = `Pregunta: ${userQuestion}\nRegistros de auditoría:\n${auditData}\nResponde en lenguaje natural usando los datos.`;
    // Llama a Gemini
    const geminiRes = await axios.post(GEMINI_URL, {
      contents: [
        { parts: [ { text: prompt } ] }
      ]
    });
    // Respuesta IA
    const iaMessage = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta de Gemini';
    res.json({ message: iaMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => console.log('Servidor IA escuchando en puerto 4000'));