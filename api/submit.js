export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
      const data = req.body;
      const scriptRes = await fetch(process.env.SHEET_SCRIPT_URL, {
          method: 'POST',
          body: new URLSearchParams(data)
      });
      if (scriptRes.ok) res.status(202).send();
      else res.status(500).send('Failed to submit');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
}
