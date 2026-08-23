import jsonfile from 'jsonfile';
import moment from 'moment';
import simpleGit from 'simple-git';
import random from 'random';

const FILE_PATH = './data.json';
const git = simpleGit();

// Helper function to create a single commit between April and June
const makeCommit = async () => {
    // Set the exact start date
    const start = moment('2026-04-01');
    
    // There are 90 days between April 1st and June 30th
    // Pick a random number of days to add to April 1st
    const randomDays = random.int(0, 90);
    
    // Generate the final random date in that range
    const date = start.add(randomDays, 'days').format();
    const data = { date: date };

    // 1. Write the date to our dummy file
    await jsonfile.writeFile(FILE_PATH, data);
    
    // 2. Add the file to git
    await git.add(FILE_PATH);
    
    // 3. Commit the file with a backdated timestamp
    await git.commit(date, { '--date': date });
    
    return date; // Return the date so we can print it in the console
};

// Recursive function to generate multiple random commits
const makeRandomCommits = async (n) => {
    // Base condition: when we hit 0, push everything to GitHub
    if (n === 0) {
        console.log("Finished making commits. Pushing to remote...");
        return git.push();
    }

    // Call makeCommit without needing X and Y coordinates anymore
    const dateCommitted = await makeCommit();
    console.log(`Creating commit ${n} for date: ${dateCommitted}`);

    // Recursively call the function for the next commit
    await makeRandomCommits(n - 1);
};

// Start the process by generating 100 random commits!
makeRandomCommits(100);