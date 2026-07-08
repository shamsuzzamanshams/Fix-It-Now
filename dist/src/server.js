import app from "./app";
import config from "./config";
const PORT = config.port;
async function main() {
    try {
        app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.log("Error Starting in the server", error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=server.js.map