import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port

async function main() {

	try {
		await prisma.$connect();
		console.log("Connected DB Successfully");
		app.listen(PORT, () => {
			console.log(`server is running on port ${PORT}`);

		})
	} catch (error) {
		console.log("Error Starting in the server", error);
		await prisma.$disconnect();
		process.exit(1);
	}

}
main();