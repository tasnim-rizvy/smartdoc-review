import { Router } from "express";

const router = Router();

router.get('/logs', async (req, res) => {
    // Logic to retrieve logs here
    console.log('Retrieving logs');
    res.send('Logs retrieved');
});

router.get('stats', async (req, res) => {
    // Logic to retrieve stats here
    console.log('Retrieving stats');
    res.send('Stats retrieved');
});

export default router;