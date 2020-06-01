import { testNormaliseDataWithTestPipe } from './normalise-data.js';

async function run_database_tests() {
    try {
        console.log("========================================== testNormaliseDataWithTestPipe");
        await testNormaliseDataWithTestPipe();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

run_database_tests();
