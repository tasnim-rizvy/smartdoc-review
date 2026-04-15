import { Router } from "express";

const router = Router();

router.post('/', async (req, res) => {
    // Logic to retrieve documents here
    console.log('Retrieving response');
    res.send('Response retrieved');
});

router.get('/history', async (req, res) => {
    // Logic to retrieve response history here
    console.log('Retrieving response history');
    res.send('Response history retrieved');
});

export default router;