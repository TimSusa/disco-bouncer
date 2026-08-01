// Test: does require('electron') work when entry point doesn't use it?
console.log("typeof require('electron'):", typeof require("electron"));
console.log("electron string:", require("electron"));
process.exit(0);
