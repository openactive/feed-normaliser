import { testNormaliseDataWithTestPipe } from './normalise-data.js';
import { testNormaliseDeletedData } from './normalise-deleted-data.js';

async function run_database_tests() {
    try {
        console.log("========================================== testNormaliseDataWithTestPipe");
        await testNormaliseDataWithTestPipe();
        console.log("========================================== testNormaliseDeletedData");
        await testNormaliseDeletedData();
        console.log("========================================== FINISHED!");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }

}

run_database_tests();
