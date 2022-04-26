#!/usr/bin/env node

const inq = require("inquirer");
const http = require("http");
const { getTsBuildInfoEmitOutputFilePath } = require("typescript");
const { exit } = require("process");

const questions = [
  {
    name: "command",
    type: "input",
    message: "Tell Steve what you want to say\n",
    validate: function (value) {
      if (value.length) {
        return true;
      } else {
        return "Please send input\n";
      }
    },
  },
];

let response = "";

async function getInput() {
  await inq.prompt(questions).then((answers) => {
    // console.log("\nYou said:");
    response = answers["command"];
    console.log(response);
  });
}

async function run() {
  // Creating server
  const server = http.createServer((req, res) => {
    // Sending the response
    res.write(response);
    console.log("Input sent\n");
    response = "";
    res.end();
  });

  // Server listening to port 3000
  server.listen(3000, () => {});

  while (response != "quit") {
    await getInput();
  }
  process.exit();
}

run();
