const fetch = require("node-fetch");
const fs = require("fs").promises;
const readline = require("readline-promise");

const rl = readline.default.createInterface({
    input: process.stdin,
    output: process.stdout
});

const prompt = async () => {
    const enteredAnswer = await rl.questionAsync("Type in a number between 1-83: ");
    try {
        if (!+enteredAnswer) {
            throw new Error("* Type in a valid number!");
        } else if (enteredAnswer < 1 || enteredAnswer > 83) {
            throw new Error("* Number not within the specified range! Try again.");
        }
        return enteredAnswer;
    } catch(e) {
        console.error(e.message);
        await prompt();
    }
};

const fetchPerson = async id => {
    let fetchedData = await fetch(`https://swapi.dev/api/people/${id}`)
    try {
        if (fetchedData.status === 404) {
            throw new Error("* The person not found :( Try again!");
        }
        return await fetchedData.json();
    } catch(e) {
        console.error(e.message);
        let enteredAnswer = await prompt();
        return await fetchPerson(enteredAnswer);
    }
};

const createFileName = person => {
    const name = person.name;
    return name.split(' ').join('_');
};

const stringifyForWriteFile = person => {
    const serialized = JSON.stringify(person);
    return serialized.split(",").join("\n");
};

const writeToFile = person => {
    return fs.writeFile(
            `./people/${createFileName(person)}.txt`,
            stringifyForWriteFile(person),
            "utf8");
            
};

(async () => {
    const typedAnswer = await prompt();
    const person = await fetchPerson(typedAnswer);

    writeToFile(person)
        .catch((e) => {
        fs.mkdir("./people/");
        })
        .then(res => writeToFile(person))

    rl.close();
})();