export default async function handler(req, res) {
  const page = req.query.page || 1;
  const q = req.query.q || 'international+relations+diplomacy';

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&page=${page}&pageSize=12&sortBy=publishedAt&apiKey=${process.env.NEWS_API}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "OsInt-Dashboard/1.0"
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
