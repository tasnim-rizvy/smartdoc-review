import app from "./app";

const PORT = process.env.PORT || 4000

async function startServer() {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});