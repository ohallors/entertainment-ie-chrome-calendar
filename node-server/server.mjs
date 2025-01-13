import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/fetch-tv-listings', async (req, res) => {
    try {
        const dateParam = req.query.date || new Date().toISOString().slice(0, 10);

        const url = `https://entertainment.ie/tv/load/all-channels/sport/1/?page=1&type=sport&date=${dateParam}&time=all-day&limit=150`;
        console.log('Fetching data for date:', url);
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});