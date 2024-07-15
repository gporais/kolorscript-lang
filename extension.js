// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const outputChannel = vscode.window.createOutputChannel("KolorScript");
const { readFileSync } = require('fs');
const { readdirSync } = require('fs');
const { lstatSync } = require('fs');
const { openSync } = require('fs');
const { readSync } = require('fs');
const { closeSync } = require('fs');
const { fstatSync } = require('fs');
const { Buffer } = require('buffer');
let fp = vscode.window.activeTextEditor.document.uri.fsPath;
const isNix = (fp[0] == '/');
let path = require('path');

const Types = {
	KS_TYPE_NUMBER: 0,
	KS_TYPE_STRING: 1,
	KS_TYPE_BUILTIN_FUNC: 2,
	KS_TYPE_USERDEF_FUNC: 3,
	KS_TYPE_USERDEF_VAR: 4,
	KS_TPYE_USERDEF_CONST: 5
};

const States = {
	KS_STATE_INTERPRET: 0,
	KS_STATE_COMPILE_FUNC: 1,
	KS_STATE_COMPILE_VAR: 2,
	KS_STATE_COMPILE_CONST: 3
};

const ColorTags = [["BLUE", "VIOLET", "RED"],["GREEN", "GREEN", "GREEN"],["YELLOW", "YELLOW", "YELLOW"]];

let PC = 0;
let currState = States.KS_STATE_INTERPRET;
let errorMessage = "";
let dictionaryObj = {};
let funcDesc = [];
let curFullPath = [];
let listOfFiles = [];
let isPrintOut = false;
let isVerbose = false;
let isPause = false;

let savePre = 0;
let savePost = 0;
let saveisYellow = false;
let saveREDword = "";
let saveREDline = 0;
let saveDef = "";
let saveRow = 0;
let saveCol = 0;
let saveLines = [];
let saveFullPath = "";

let isSkip = false;
let isSemi = false;
let isThen = false;
let isIf = false;

let forCnt = 0;
let forRow = 0;
let forCol = 0;
let isFor = false;
let isNext = false;

const dataStack = [];
const returnStack = [];
const codeArray = [];
const ifStack = [];
const forStack = [];
const fdStack = [];
const buffSize = 1024;

let builtInDesc = [
	{	name: "Built-in",
		nameMaxLen: 0,
		seffectMaxLen: 0,
		details: [{name: "*", stackEffect: "num1 num2 -- num3", description: "num3 = num1 * num2"},
			{name: "/", stackEffect: "num1 num2 -- num3", description: "num3 = num1 / num2"},
			{name: "+", stackEffect: "any1 any2 -- any3", description: "any3 = any1 + any2"},
			{name: "-", stackEffect: "num1 num2 -- num3", description: "num3 = num1 - num2"},
			{name: ">>", stackEffect: "num1 num2 -- num3", description: "num3 = num1 >> num2"},
			{name: "<<", stackEffect: "num1 num2 -- num3", description: "num3 = num1 << num2"},
			{name: "2/", stackEffect: "num1 -- num2", description: "num2 = num1 >> 1"},
			{name: "2*", stackEffect: "num1 -- num2", description: "num2 = num1 << 1"},
			{name: "and", stackEffect: "num1 num2 -- num3", description: "num3 = num1 & num2 (bitwise AND)"},
			{name: "or", stackEffect: "num1 num2 -- num3", description: "num3 = num1 | num2 (bitwise OR)"},
			{name: "xor", stackEffect: "num1 num2 -- num3", description: "num3 = num1 ^ num2 (bitwise XOR)"},
			{name: "not", stackEffect: "num1 -- num2", description: "num2 = ~num1 (bitwise NOT)"},				  
			{name: "min", stackEffect: "num1 num2 -- num3", description: "num3 = minimum value between num1 and num2"},
			{name: "max", stackEffect: "num1 num2 -- num3", description: "num3 = maximum value between num1 and num2"},
			{name: "abs", stackEffect: "num1 -- num2", description: "num2 = absolute value of num1"},
			{name: "ms", stackEffect: "num --", description: "num: number of miliseconds to delay"},				  
			{name: ";", stackEffect: "--", description: "; means return to calling word"},
			{name: "push", stackEffect: "any -- => R: -- any", description: "any is popped from Data stack and pushed into Return stack"},
			{name: "pop", stackEffect: "-- any <= R: any --", description: "any is popped from Return stack and pushed into Data stack"},
			{name: "dup", stackEffect: "any -- any any", description: ""},
			{name: "drop", stackEffect: "any -- ", description: ""},
			{name: "over", stackEffect: "any1 any2 -- any1 any2 any1", description: ""},
			{name: "swap", stackEffect: "any1 any2 -- any2 any1", description: ""},
			{name: "nip", stackEffect: "any1 any2 -- any2", description: ""},
			{name: "if", stackEffect: "num --", description: "jump to 'then' if num is zero"},
			{name: "-if", stackEffect: "num --", description: "jump to 'then' if num is positive number"},
			{name: "then", stackEffect: "--", description: ""},			
			{name: "=", stackEffect: "any1 any2 -- any1 any2 num", description: "num = 1 if any1 equal to any2, else 0"},
			{name: ">", stackEffect: "any1 any2 -- any1 any2 num", description: "num = 1 if any1 greater than any2, else 0"},
			{name: "<", stackEffect: "any1 any2 -- any1 any2 num", description: "num = 1 if any1 less than any2, else 0"},
			{name: "for", stackEffect: "num -- => R: -- num", description: "num is the count of loop. NOTE: 'for' loop will actually loop count+1 times."},
			{name: "next", stackEffect: "--", description: "decerement top of Return stack if its not 0 and jump to word after 'for'"},
			{name: "i", stackEffect: "-- num", description: "num = current count of loop which is current top of Return stack"},
			{name: "@", stackEffect: "<variable name> -- any", description: "any = value fetched from the variable"},
			{name: "!", stackEffect: "any <variable name> --", description: "any: value to be stored in the variable"},
			{name: "load", stackEffect: "str --", description: "str: either filename, path+filename, or a line of code"},
			{name: ".", stackEffect: "--", description: "top of D is popped and printed in output window"},
			{name: ".s", stackEffect: "--", description: "print contents of Data stack and Return stack in normal format"},
			{name: ".sih", stackEffect: "--", description: "print contents of Data stack and Return stack in hex format"},			
			{name: "cls", stackEffect: "--", description: "it clears the output window"},
			{name: "num?", stackEffect: "any -- any num", description: "num = 1 if any is a number, else 0"},
			{name: "str?", stackEffect: "any -- any num", description: "num = 1 if any is a string, else 0"},
			{name: "utime", stackEffect: "-- num", description: "num = the number of milliseconds elapsed since midnight, January 1, 1970 (UTC)"},
			{name: "timestamp", stackEffect: "-- str", description: "str = current local date and time"},
			{name: "open-file", stackEffect: "str -- fid", description: "str: either filename or path+filename"},
			{name: "read-line", stackEffect: "fid -- str num", description: "str = line read from the file based on fid, num = lenght of str"},
			{name: "close-file", stackEffect: "fid --", description: "it closes the specific file based on fid"},
			{name: "drop-all", stackEffect: "--", description: "it clears the Data stack"},
			{name: "count-all", stackEffect: "-- num", description: "num = total count of items in Data stack"},
			{name: "split-str", stackEffect: "str1 str2 -- strN1 strN2 strNx num", description: "str1: string to be split, str2: separator, num = number of strings after split"}]}
];
const builtInFunc = {
	"*" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(a * b);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"/" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(a / b);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"+" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(a + b);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"-" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(a - b);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	">>" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(a >> b);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"<<" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(a << b);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"2/" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const t = dataStack.pop();
			dataStack.push(t >> 1);
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"2*" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const t = dataStack.pop();
			dataStack.push(t << 1);
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"and" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(a & b);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"or" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(a | b);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"xor" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(a ^ b);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"not" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const t = dataStack.pop();
			dataStack.push(~t);
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"min" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(Math.min(a, b));
		}
		else {
			errorMessage = "expects two numbers in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"max" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const b = dataStack.pop();
			const a = dataStack.pop();
			dataStack.push(Math.max(a, b));
		}
		else {
			errorMessage = "expects two numbers in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"abs" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const t = dataStack.pop();
			dataStack.push(Math.abs(t));
		}
		else {
			errorMessage = "expects a number in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"ms" : function() {
		let isSuccess = true;
		if(isPause) {
			isPause = false;			
		}
		else {
			if(dataStack.length > 0) {
				const t = dataStack.pop();			
				isPause = true;
				
				setTimeout(function(){loadFile(saveLines, saveFullPath);}, t);
			}
			else {
				errorMessage = "expects a number in Data stack";
				isSuccess = false;
			}
		}
		return isSuccess;
	},
	";" : function() {
		let isSuccess = true;
		if(returnStack.length > 0) {
			PC = returnStack.pop();
		}
		else {
			errorMessage = "Nothing to pop from return stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"push" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const t = dataStack.pop();
			returnStack.push(t);
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"pop" : function() {
		let isSuccess = true;
		if(returnStack.length > 0) {
			const r = returnStack.pop();
			dataStack.push(r);
		}
		else {
			errorMessage = "expects a value in Return stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"dup" : function() {
		let isSuccess = true;
		const dsLen = dataStack.length;
		if(dsLen > 0) {
			const t = dataStack[dsLen-1];
			dataStack.push(t);
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"drop" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			dataStack.pop();
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"over" : function() {
		let isSuccess = true;
		const dsLen = dataStack.length;
		if(dsLen > 1) {
			const s = dataStack[dsLen-2];
			dataStack.push(s);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"swap" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const t = dataStack.pop();
			const s = dataStack.pop();
			dataStack.push(t);
			dataStack.push(s);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"nip" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const t = dataStack.pop();
			dataStack.pop();
			dataStack.push(t);
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"if" : function(addr) {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const t = dataStack.pop();
			if(isNaN(t)) {
				errorMessage = "top value of Data stack is not a number";
				isSuccess = false;
			}
			else {
				if(t == 0) {
					PC = addr;
				}
				else {
					PC++;
				}
			}
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"-if" : function(addr) {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const t = dataStack.pop();
			if(isNaN(t)) {
				errorMessage = "top value of Data stack is not a number";
				isSuccess = false;
			}
			else {
				if(t >= 0) {
					PC = addr;
				}
				else {
					PC++;
				}
			}
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"then" : function() {
	},
	"=" : function() {
		let isSuccess = true;
		const dsLen = dataStack.length;
		if(dsLen > 1) {
			const t = dataStack[dsLen-1];
			const s = dataStack[dsLen-2];
			if(s === t) {
				dataStack.push(1);
			}
			else {
				dataStack.push(0);
			}
			
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	">" : function() {
		let isSuccess = true;
		const dsLen = dataStack.length;
		if(dsLen > 1) {
			const t = dataStack[dsLen-1];
			const s = dataStack[dsLen-2];
			if(s > t) {
				dataStack.push(1);
			}
			else {
				dataStack.push(0);
			}
			
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"<" : function() {
		let isSuccess = true;
		const dsLen = dataStack.length;
		if(dsLen > 1) {
			const t = dataStack[dsLen-1];
			const s = dataStack[dsLen-2];
			if(s < t) {
				dataStack.push(1);
			}
			else {
				dataStack.push(0);
			}
			
		}
		else {
			errorMessage = "expects two values in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"for" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const t = dataStack.pop();
			if(isNaN(t)) {
				errorMessage = "top value of Data stack is not a number";
				isSuccess = false;
			}
			else {
				returnStack.push(t);
			}
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"next" : function(addr) {
		let isSuccess = true;
		const rsLen = returnStack.length;
		if(rsLen > 0) {
			if(returnStack[rsLen-1] > 0) {
				PC = addr;
				returnStack[rsLen-1]--;
			}
			else {
				returnStack.pop();
				PC++;
			}
		}
		else {
			errorMessage = "expects a value in Return stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"i" : function() {
		let isSuccess = true;
		const rsLen = returnStack.length;
		if(rsLen > 0) {
			dataStack.push(returnStack[rsLen-1]);
		}
		else {
			errorMessage = "expects a value in Return stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"@" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const i = dataStack.pop();
			if(codeArray[i].type == Types.KS_TYPE_USERDEF_VAR) {
				dataStack.push(codeArray[i].val);
			}
			else {
				errorMessage = "cannot fetch from non-variable words";
				isSuccess = false;
			}
		}
		else {
			errorMessage = "expects the variables index in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"!" : function() {
		let isSuccess = true;
		if(dataStack.length > 1) {
			const i = dataStack.pop();
			const v = dataStack.pop();
			if(codeArray[i].type == Types.KS_TYPE_USERDEF_VAR) {
				codeArray[i].val = v;
			}
			else {
				errorMessage = "cannot store to non-variable words";
				isSuccess = false;
			}
		}
		else {
			errorMessage = "expects a value and variables index in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"load" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const d = dataStack.pop();
			if(isNaN(d)) {
				let td = d;
				let tfpp;
				let tfp;
				let pathSym = "\\";

				// Check fullpath if Unix system or not
				if(isNix) {
					pathSym = "/";
					// Check if filepath has Windows format
					if(d.includes("\\")) {
						td = d.split('\\').join('/');
					}				

					tfpp = fp.substring(0, fp.lastIndexOf("/") + 1) + td;
					tfp = tfpp;
				}
				else {
					// Check if filepath has Unix format
					if(d.includes("/")) {
						td = d.split('/').join('\\');
					}				

					tfpp = fp.substring(0, fp.lastIndexOf("\\") + 1) + td;
					tfp = tfpp.split('\\').join('\\\\');
				}

				// Check if d is a file
				if(d.substring(d.lastIndexOf(".") + 1, d.length) == "ks") {			
					try {
						const data = readFileSync(tfp);
						isSuccess = loadFile(data.toString().split(/\r?\n/), tfpp);
						if(!isSuccess) {
							errorMessage = "cancel";
						}
					} catch (error) {
						errorMessage = "Unable to load " +  tfpp;
						isSuccess = false;
					}
				}
				// Check if folder
				else if(tfp[tfp.length-1] == pathSym) {
					try {
						traverseDir(tfp);
						for (let i = 0; i < listOfFiles.length; i++) {
							const data = readFileSync(listOfFiles[i]);
							isSuccess = loadFile(data.toString().split(/\r?\n/), listOfFiles[i]);
							if(!isSuccess) {
								errorMessage = "cancel";
								break;
							}
						}					
					} catch (error) {
						errorMessage = "Unable to load " +  tfpp;
						isSuccess = false;
					}
				}
				else {
					isSuccess = loadFile(d.split("\\n"), "string from " + curFullPath[curFullPath.length - 1]);
					if(!isSuccess) {
						errorMessage = "cancel";
					}
				}
			}
			else {
				errorMessage = "expects a string for filename OR a line of code";
				isSuccess = false;
			}
		}
		else {
			errorMessage = "expects a string in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"." : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const d = dataStack.pop();
			if(isNaN(d)) {
				if(d.trim().length > 0) {
					if(d.trim() === "\\n") {
						outputChannel.appendLine("");
					}
					else {
						const outList = d.split("\\n");
						for (let i = 0; i < outList.length; i++) {
							if(outList[i].length > 0) {
								if(i < (outList.length - 1)) {
									outputChannel.appendLine(outList[i] + " ");
								}
								else {
									outputChannel.append(outList[i] + " ");
								}
							}
						}
					}					
				}
			}
			else {
				outputChannel.append(d + " ");
			}			
			isPrintOut = true;
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	".s" : function() {
		let isSuccess = true;
		if(isPrintOut) {
			outputChannel.appendLine("");
			isPrintOut = false;
		}

		outputChannel.append("D: ");
		dataStack.forEach((item) => {
			outputChannel.append("[" + item + "] ");
		});
		
		outputChannel.appendLine("");
		outputChannel.append("R: ");
		returnStack.forEach((item) => {
			outputChannel.append("[" + item + "] ");
		});

		outputChannel.appendLine("");
		return isSuccess;
	},
	".sih" : function() {
		let isSuccess = true;
		if(isPrintOut) {
			outputChannel.appendLine("");
			isPrintOut = false;
		}

		outputChannel.append("D: ");
		dataStack.forEach((item) => {
			if(typeof item == "string") {
				const chr = item.split("");
				let chrs = "";
				chr.forEach((element) => {chrs += (element.charCodeAt(0).toString(16).toUpperCase() + " ");});
				outputChannel.append("[" + chrs.trim() + "] ");
			}
			else {
				outputChannel.append("[" + ((item)>>>0).toString(16).toUpperCase() + "] ");
			}			
		});
		
		outputChannel.appendLine("");
		outputChannel.append("R: ");
		returnStack.forEach((item) => {
			if(typeof item == "string") {
				const chr = item.split("");
				let chrs = "";
				chr.forEach((element) => {chrs += (element.charCodeAt(0).toString(16).toUpperCase() + " ");});
				outputChannel.append("[" + chrs.trim() + "] ");
			}
			else {
				outputChannel.append("[" + ((item)>>>0).toString(16).toUpperCase() + "] ");
			}
		});

		outputChannel.appendLine("");
		return isSuccess;
	},
	"cls" : function() {
		let isSuccess = true;
		outputChannel.clear();
		return isSuccess;
	},
	"num?" : function() {
		let isSuccess = true;
		const dsLen = dataStack.length;
		if(dsLen > 0) {
			const t = dataStack[dsLen-1];
			if(isNaN(t)) {
				dataStack.push(0);
			}
			else {
				dataStack.push(1);
			}
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"str?" : function() {
		let isSuccess = true;
		const dsLen = dataStack.length;
		if(dsLen > 0) {
			const t = dataStack[dsLen-1];
			if(isNaN(t)) {
				dataStack.push(1);
			}
			else {
				dataStack.push(0);
			}
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"utime" : function() {
		let isSuccess = true;
		dataStack.push(Date.now());
		return isSuccess;
	},
	"timestamp" : function() {
		let isSuccess = true;
		dataStack.push(new Date().toLocaleString());
		return isSuccess;
	},
	"open-file" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const d = dataStack.pop();
			let td = d;
			let tfpp;
			let tfp;

			// Check fullpath if Unix system or not
			if(isNix) {				
				// Check if filepath has Windows format
				if(d.includes("\\")) {
					td = d.split('\\').join('/');
				}				

				tfpp = fp.substring(0, fp.lastIndexOf("/") + 1) + td;
				tfp = tfpp;
			}
			else {
				// Check if filepath has Unix format
				if(d.includes("/")) {
					td = d.split('/').join('\\');
				}				

				tfpp = fp.substring(0, fp.lastIndexOf("\\") + 1) + td;
				tfp = tfpp.split('\\').join('\\\\');
			}

			try {
				let fd = openSync(tfp);
				dataStack.push(fd);
				fdStack.push({fid: fd, pos: 0, numBytesRead: 0, totalBytesRead: 0, buff: Buffer.alloc(buffSize), fsize: fstatSync(fd).size});				
			} catch(error) {
				errorMessage = "Unable to open: " + tfpp;
				isSuccess = false;
			}
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}			
		return isSuccess;
	},
	"read-line" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const fd = dataStack.pop();

			try {
				if(fdStack.length > 0) {
					let i=0;
					for(; i<fdStack.length; i++) {
						if(fdStack[i].fid == fd) {
							
							let startPos = 0;
							let endPos = 0;
							let newLine = false;
							let newPos = false;
							let strLine = "";

							while(fdStack[i].totalBytesRead <= fdStack[i].fsize) {
								if(fdStack[i].numBytesRead == fdStack[i].pos) {
									fdStack[i].numBytesRead = readSync(fd, fdStack[i].buff);
									fdStack[i].totalBytesRead += fdStack[i].numBytesRead;
									fdStack[i].pos = 0;
								}

								startPos = fdStack[i].pos;
								endPos = startPos;								

								for(; endPos <  fdStack[i].numBytesRead; endPos++) {
									if(fdStack[i].buff[endPos] == 0x0a || fdStack[i].buff[endPos] == 0x0d) {
	
										newLine = true;
										break;
									}
								}

								strLine += fdStack[i].buff.toString('ascii', startPos, endPos);
	
								if(newLine) {
									//find next pos
									for(; endPos <  fdStack[i].numBytesRead; endPos++) {
										if(fdStack[i].buff[endPos] != 0x0a && fdStack[i].buff[endPos] != 0x0d) {
											newPos = true;
											break;
										}
									}
								}

								fdStack[i].pos = endPos;

								if(newPos) {									
									break;
								}								
							}

							dataStack.push(strLine);
							dataStack.push(strLine.length);
							break;
						}
					}

					if(i==fdStack.length) {
						throw "Invalid fd";
					}
				}
				else {
					throw "Empty fdstack";
				}
			} catch (error) {
				if(error == "Invalid fd") {
					errorMessage = "received an invalid fd: " + fd;
				}
				else if(error == "Empty fdstack") {
					errorMessage = "has no prior open-file executed";
				}
				else {
					errorMessage = "unable to read fd: " + fd;
				}				
				isSuccess = false;
			}
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"close-file" : function() {
		let isSuccess = true;
		if(dataStack.length > 0) {
			const fd = dataStack.pop();
			try {
				closeSync(fd);
				for(let i=0; i<fdStack.length; i++) {
					if(fdStack[i].fid == fd) {
						fdStack.splice(i,1);
						break;
					}
				}
				
			} catch (error) {
				errorMessage = "Unable to close fd: " + fd;
				isSuccess = false;
			}
		}
		else {
			errorMessage = "expects a value in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	},
	"drop-all" : function() {
		let isSuccess = true;
		dataStack.length = 0;
		return isSuccess;
	},
	"count-all" : function() {
		let isSuccess = true;
		dataStack.push(dataStack.length);
		return isSuccess;
	},
	"split-str" : function() {
		let isSuccess = true;		
		if(dataStack.length > 1) {
			const sep = dataStack.pop();
			const str = dataStack.pop();
			if(isNaN(parseInt(sep))) {
				if(isNaN(str)) {
					const splitted = str.split(sep);
					splitted.forEach((element) => dataStack.push(element));
					dataStack.push(splitted.length);
				}
				else {
					errorMessage = "expects a string to be splitted";
					isSuccess = false;
				}				
			}
			else {
				errorMessage = "expects a string for separator";
				isSuccess = false;
			}
		}
		else {
			errorMessage = "expects two strings in Data stack";
			isSuccess = false;
		}
		return isSuccess;
	}
};

function traverseDir(dir) {
	listOfFiles.length = 0;
	readdirSync(dir).forEach(file => {
	  let fullPath = path.join(dir, file);
	  if (lstatSync(fullPath).isDirectory()) {
		traverseDir(fullPath);		
	  }
	  else {
		console.log(fullPath);
		listOfFiles.push(fullPath);
	  }
	});
}

function printMsg(msg, isLine) {
	if(isVerbose) {
		if(isPrintOut) {
			outputChannel.appendLine("");
			isPrintOut = false;
		}

		if(isLine) {
			outputChannel.appendLine(msg);
		}
		else {
			outputChannel.append(msg);
		}		
	}
}

function ksExecute(codeIdx) {
	let isOK = true;

	if(isPause) {
		PC -= 1;
	}
	else {
		PC = codeIdx;
		returnStack.push(PC);
	}

	while(isOK) {
		isOK = codeArray[PC].exec();
		if(isPause || returnStack.length == 0) {
			break;
		}
	}

	return isOK;
}

function ksInterpret(codeWord) {
	let isOK = true;

	if(!isNaN(codeWord)) {
		// Push literal number to data stack
		const num = Number(codeWord);
		dataStack.push(num);
	}
	else {
		if((codeWord[0] == "'" && codeWord[codeWord.length - 1] == "'") || (codeWord[0] == "\"" && codeWord[codeWord.length - 1] == "\"")) {
			// Push literal string to data stack
			dataStack.push(codeWord.slice(1, -1));
		}
		else {
			if(dictionaryObj[codeWord] != null) {
				if(typeof dictionaryObj[codeWord] === 'function') {
					if(codeWord == "if") {
						const t = dataStack.pop();
						isIf = true;
						isSemi = false;
						if(t == 0) {							
							isSkip = true;
						}
						else {							
							isSkip = false;
						}
					}
					else if(codeWord == "-if") {
						const t = dataStack.pop();
						isIf = true;
						isSemi = false;
						if(t >= 0) {							
							isSkip = true;
						}
						else {							
							isSkip = false;
						}
					}
					else if(codeWord == "then") {
						isThen = true;
						if(isSemi) {
							isSkip = !isSkip;
						}
						else {
							isSkip = false;
						}
						isSemi = false;
					}
					else if(codeWord == ";") {
						isSemi = true;
						if(isThen) {
							isSkip = false;
							isThen = false;
						}
						else if(isIf) {
							isIf = false;
						}
					}
					else if(codeWord == "for") {
						if(dataStack.length > 0) {
							const t = dataStack.pop();
							if(isNaN(t)) {
								errorMessage = "top value of Data stack is not a number";
								isOK = false;
							}
							else {
								forCnt = t;
								isFor = true;
								isNext = false;
							}
						}
						else {
							errorMessage = "expects a value in Data stack";
							isOK = false;
						}
					}
					else if(codeWord == "i") {
						dataStack.push(forCnt);
					}
					else if(codeWord == "next") {
						if(forCnt > 0) {
							isNext = true;
							forCnt--;
						}
						else {
							isNext = false;
						}
					}
					else {
						// Execute core word
						isOK = dictionaryObj[codeWord]();
					}
				}
				else if(typeof dictionaryObj[codeWord] === 'number') {
					// Execute user func
					isOK = ksExecute(dictionaryObj[codeWord]);
				}
				else {
					if(dictionaryObj[codeWord].const) {
						// Execute user const
						dataStack.push(codeArray[dictionaryObj[codeWord].addr].val);
					}
					else {
						// Execute user var
						dataStack.push(dictionaryObj[codeWord].addr);
					}
				}
			}
			else {
				isOK = false;
				errorMessage = "is undefined";
			}
			
		}		
	}

	return isOK;
}

function ksCompile(codeWord) {
	let isOK = true;

	if(!isNaN(codeWord)) {
		const num = Number(codeWord);
		
		if(currState == States.KS_STATE_COMPILE_CONST) {
			// Create object that push literal number to data stack
			codeArray.push({type: Types.KS_TPYE_USERDEF_CONST, val: num});

			// User defined variable initialized, return to Interpret state
			currState = States.KS_STATE_INTERPRET;
			printMsg("OK", true);
		}
		else if(currState == States.KS_STATE_COMPILE_VAR) {
			// Create object that push literal number to data stack
			codeArray.push({type: Types.KS_TYPE_USERDEF_VAR, val: num});

			// User defined variable initialized, return to Interpret state
			currState = States.KS_STATE_INTERPRET;
			printMsg("OK", true);
		}
		else {
			// Create object that push literal number to data stack
			codeArray.push({type: Types.KS_TYPE_NUMBER, val: num, exec: function() {dataStack.push(this.val); PC++; return true;}});
		}
	}
	else {
		if((codeWord[0] == "'" && codeWord[codeWord.length - 1] == "'") || (codeWord[0] == "\"" && codeWord[codeWord.length - 1] == "\"")) {
			const str = codeWord.slice(1, -1);
			
			if(currState == States.KS_STATE_COMPILE_CONST) {
				// Create object that push literal string to data stack
				codeArray.push({type: Types.KS_TPYE_USERDEF_CONST, val: str});
	
				// User defined variable initialized, return to Interpret state
				currState = States.KS_STATE_INTERPRET;
				printMsg("OK", true);
			}
			else if(currState == States.KS_STATE_COMPILE_VAR) {
				// Create object that push literal string to data stack
				codeArray.push({type: Types.KS_TYPE_USERDEF_VAR, val: str});
	
				// User defined variable initialized, return to Interpret state
				currState = States.KS_STATE_INTERPRET;
				printMsg("OK", true);
			}
			else {
				codeArray.push({type: Types.KS_TYPE_STRING, val: str, exec: function() {dataStack.push(this.val); PC++; return true;}});
			}
		}
		else {
			if(currState == States.KS_STATE_COMPILE_FUNC) {
				if(dictionaryObj[codeWord] != null) {
					if(typeof dictionaryObj[codeWord] === 'function') {
						const prevIdx = codeArray.length - 1;
						// Check if ';'
						if(codeWord == ';') {
							if(currState == States.KS_STATE_COMPILE_FUNC) {
								if(prevIdx >= 0) {
									if(codeArray[prevIdx].type == Types.KS_TYPE_USERDEF_FUNC) {
										const tmpVal = codeArray[prevIdx].val;
										codeArray.pop();
										// Create object that execute jump for previous word
										codeArray.push({type: Types.KS_TYPE_USERDEF_FUNC, val: tmpVal, exec: function() {PC = this.val; return true;}});
									}
									else {
										// Create object that execute return
										codeArray.push({type: Types.KS_TYPE_BUILTIN_FUNC, val: 0, exec: function() {const isOK = dictionaryObj[codeWord](); PC++; return isOK;}});
									}
								}
								else {
									// Create object that execute return
									codeArray.push({type: Types.KS_TYPE_BUILTIN_FUNC, val: 0, exec: function() {const isOK = dictionaryObj[codeWord](); PC++; return isOK;}});
								}

								if(ifStack.length == 0) {
									// User defined function closed with semi-colon, return to interpret state
									currState = States.KS_STATE_INTERPRET;
									printMsg("OK", true);
								}

								if(forStack.length > 0 && currState == States.KS_STATE_INTERPRET) {
									isOK = false;
									errorMessage = "'for' has no matching 'next'";
								}
							}
						}
						else if(codeWord == 'if' || codeWord == '-if') {
							// Create object that if/-if
							codeArray.push({type: Types.KS_TYPE_BUILTIN_FUNC, val: 0, exec: function() {const isOK = dictionaryObj[codeWord](this.val); return isOK;}});
							
							// Push index of if/-if for then
							ifStack.push(codeArray.length-1);
						}
						else if(codeWord == 'then') {
							if(ifStack.length > 0) {
								const i = ifStack.pop();
								codeArray[i].val = codeArray.length;

								// 'then' word found, extend the compile state
								currState = States.KS_STATE_COMPILE_FUNC;
							}
						}
						else if(codeWord == 'for') {	
							// Create object
							codeArray.push({type: Types.KS_TYPE_BUILTIN_FUNC, val: 0, exec: function() {const isOK = dictionaryObj[codeWord](); PC++; return isOK;}});
							
							// Push index after 'for' to be used on 'next'
							forStack.push(codeArray.length);
						}
						else if(codeWord == 'next') {
							if(forStack.length > 0) {
								const i = forStack.pop();

								// Create object that for
								codeArray.push({type: Types.KS_TYPE_BUILTIN_FUNC, val: i, exec: function() {const isOK = dictionaryObj[codeWord](this.val); return isOK;}});
							}
						}
						else {
							// Create object that execute built-in word
							codeArray.push({type: Types.KS_TYPE_BUILTIN_FUNC, val: 0, exec: function() {const isOK = dictionaryObj[codeWord](); PC++; return isOK;}});
						}
					}
					else if(typeof dictionaryObj[codeWord] === 'number') {
						// Create object that execute user defined word
						codeArray.push({type: Types.KS_TYPE_USERDEF_FUNC, val: dictionaryObj[codeWord], exec: function() {returnStack.push(PC); PC = this.val; return true;}});
					}
					else {
						if(dictionaryObj[codeWord].const) {
							errorMessage = "is a constant, please change the word to YELLOW to retrieve the value";
						}
						else {
							errorMessage = "is a variable, please change the word to YELLOW to retrieve the address";
						}
						isOK = false;
					}
				}
				else {
					isOK = false;
					errorMessage = "is undefined";
				}
			}
			else {
				errorMessage = "is not valid in initializing a constant, only GREEN number or string is allowed";
				isOK = false;
			}
		}		
	}

	console.log("Compile: ", codeWord, codeArray);

	return isOK;
}

function getString(words, j, quote) {
	let isOK = true;
	let isClosed = false;
	let i = j;
	let s = "";

	if(quote == "(") {
		quote = ")";
	}
	else if(quote == "") {
		isClosed = true;
	}

	while (i < words.length) {
		s += words[i];
		if(s.length > 1 && s[s.length - 1] == quote) {
			isClosed = true;
			s = "\"" + s.slice(1,-1) + "\"";
			break;
		}

		i++;
	}

	if(!isClosed) {
		errorMessage = "string has a missing closing " + quote;
		isOK = false;
	}

	return { isOK: isOK, str: s, j: i };
}

function checkName(name, lit) {
	let isLit = false;

	if(!isNaN(name)) {
		errorMessage = "is a number, please use a word to name a " + lit;
		isLit = true;
	}
	else if(name[0] == "'" || name[0] == "\"") {
		errorMessage = "is a string, please use a word to name a " + lit;
		isLit = true;
	}

	return isLit;
}

function toggleTheme(isLight, isColorBlind) {
	if(isLight) {
		if(isColorBlind) {
			vscode.workspace.getConfiguration().update("workbench.colorTheme", "kolorScript Color Blind Theme (light)", vscode.ConfigurationTarget.Global);
		}
		else {
			vscode.workspace.getConfiguration().update("workbench.colorTheme", "kolorScript Default Theme (light)", vscode.ConfigurationTarget.Global);
		}
	}
	else {
		if(isColorBlind) {
			vscode.workspace.getConfiguration().update("workbench.colorTheme", "kolorScript Color Blind Theme (dark)", vscode.ConfigurationTarget.Global);
		}
		else {
			vscode.workspace.getConfiguration().update("workbench.colorTheme", "kolorScript Default Theme (dark)", vscode.ConfigurationTarget.Global);
		}
	}
}

function loadFile(lines, fullPath) {
	let isOK = true;
	let errorLine = 0;
	let errorWord = "";
	let currPre = 0;
	let currPost = 0;
	let isYellow = false;
	let currREDword = "";
	let currREDline = 0;
	let currDef = "";
	let fileName = "";
	let isNewConst = false;
	let isNewVar = false;
	let isNewFunc = false;
	let newWordName = "";
	let newWordSE = "";
	let newWordDesc = "";
	let initRow = 0;
	let initCol = 0;
	
	curFullPath.push(fullPath);

	if(isPause) {
		currPre = savePre;
		currPost = savePost;
		isYellow = saveisYellow;
		currREDword = saveREDword;
		currREDline = saveREDline;
		currDef = saveDef;
		initRow = saveRow;
		initCol = saveCol - 1;
	}
	else {
		printMsg("Loading " + fullPath, true);

		PC = 0;
		currState = States.KS_STATE_INTERPRET;

		dataStack.length = 0;
		returnStack.length = 0;
		ifStack.length = 0;
		forStack.length = 0;
		fdStack.length = 0;
	}

	if(isNix) {
		fileName = fullPath.substring(fullPath.lastIndexOf("/") + 1, fullPath.length);
	}
	else {
		fileName = fullPath.substring(fullPath.lastIndexOf("\\") + 1, fullPath.length);
	}

	funcDesc_pushTitle(fileName);

	for (let currRow = initRow; isOK && currRow < lines.length; currRow++) {
		const words = lines[currRow].split(/(\s+)/).filter(Boolean);
		// Check for unused tags
		if(words.length > 1 && words[words.length-1].trim().length  == 0) {
			isOK = false;
			errorMessage = "Unused tag (whitespace) found"
		}
		for (let currCol = initCol; isOK && currCol < words.length; currCol++) {
			const wordLen = words[currCol].length;
			if(wordLen > 0) {
				if(isSkip) {
					if(words[currCol] === "  " && (words[currCol+1] === "then" || words[currCol+1] === ";")) {

					}
					else {
						currCol += 1;
						continue;
					}
				}

				if(words[currCol].trim().length == 0) {
					currPre = wordLen;
					currPost = 0;
					// Check tag						
					if(wordLen > 3) {
						// Line comment
						currCol += 1;
						const res = getString(words, currCol, "");
						currCol = res.j;
						newWordDesc = res.str;
						break;
					}
					else if(wordLen == 3) {
						// Word comment
						currCol += 1;
						// Check if start with single quote
						if(words[currCol][0] == "'") {
							const res = getString(words, currCol, "'");
							
							if(res.isOK) {
								currCol = res.j;
							}
							else {
								isOK = res.isOK;
								words[currCol] = res.str;
							}
						}
						// Check if start with double quote
						else if(words[currCol][0] == "\"") {
							const res = getString(words, currCol, "\"");

							if(res.isOK) {
								currCol = res.j;
							}
							else {
								isOK = res.isOK;
								words[currCol] = res.str;
							}
						}
						// Check if start with open parenthesis
						else if(words[currCol][0] == "(") {
							const res = getString(words, currCol, "(");

							if(res.isOK) {
								currCol = res.j;
								words[currCol] = res.str.slice(1, -1);
							}
							else {
								isOK = res.isOK;
								words[currCol] = res.str;
							}
						}

						if(isNewFunc && isOK) {
							newWordSE = words[currCol];
						}
						
						continue;
					}
					else if(wordLen == 2) {
						// Go to word
						currCol += 1;

						if(words[currCol].length > 0) {
							// Check if start with single quote
							if(words[currCol][0] == "'") {
								const res = getString(words, currCol, "'");
								
								if(res.isOK) {
									isOK = ksInterpret(res.str);
									currCol = res.j;
								}
								else {
									isOK = res.isOK;
									words[currCol] = res.str;
								}
							}
							// Check if start with double quote
							else if(words[currCol][0] == "\"") {
								const res = getString(words, currCol, "\"");

								if(res.isOK) {
									isOK = ksInterpret(res.str);
									currCol = res.j;
								}
								else {
									isOK = res.isOK;
									words[currCol] = res.str;
								}
							}
							else {
								if((currState == States.KS_STATE_COMPILE_FUNC || currState == States.KS_STATE_COMPILE_VAR) && words[currCol] == currDef) {
									isOK = false;
									errorMessage = "is not valid within its own definition"
								}
								else {
									// Interpret word
									isOK = ksInterpret(words[currCol]);
								}
							}
							
							isYellow = true;
						}
						else {
							isOK = false;
							if(currState == States.KS_STATE_COMPILE_FUNC) {
								errorMessage = "incomplete";
							}
							else {
								errorMessage = "VIOLET '" + words[0] + "' must have an inline initialization of YELLOW number, string, or word(s) that leaves data on the Data stack";
							}
						}
					}
					else if(wordLen == 1) {
						// Go to word
						currCol += 1;

						if(words[currCol].length > 0) {
							if(currState == States.KS_STATE_INTERPRET) {
								isOK = false;
								errorMessage = "is not valid at Interpret state";
							}
							else if(currState == States.KS_STATE_COMPILE_VAR) {
								isOK = false;
								errorMessage = "is not valid in initializing a variable";
							}
							else {
								// Check YELLOW->GREEN transition within function definition
								if(currState == States.KS_STATE_COMPILE_FUNC && isYellow && !isIf && !isThen && !isSemi) {
									if(dataStack.length > 0) {
										let d = dataStack.pop();
										if(isNaN(d)) {
											d = "\"" + d + "\"";
										}
										isOK = ksCompile(d);
									}
								}

								// Check if start with single quote
								if(words[currCol][0] == "'") {
									const res = getString(words, currCol, "'");
									
									if(res.isOK) {
										isOK = ksCompile(res.str);
										currCol = res.j;
									}
									else {
										isOK = res.isOK;
										words[currCol] = res.str;
									}
								}
								// Check if start with double quote
								else if(words[currCol][0] == "\"") {
									const res = getString(words, currCol, "\"");

									if(res.isOK) {
										isOK = ksCompile(res.str);
										currCol = res.j;
									}
									else {
										isOK = res.isOK;
										words[currCol] = res.str;
									}
								}
								else {
									// Compile word
									isOK = ksCompile(words[currCol]);
								}

								isYellow = false;
							}
						}
						else {
							isOK = false;
							if(currState == States.KS_STATE_COMPILE_FUNC) {
								errorMessage = "incomplete";
							}
							else {
								errorMessage = "BLUE '" + words[0] + "' must have an inline initialization of GREEN number or string";
							}
						}
					}						
				}
				else {
					if(currCol == 0) {
						currPre = 0;
						currPost = 0;
						const name = words[currCol];
						if(words.length == 1) {
							isOK = false;
							printMsg("[" + fileName + "] Define '" + name + "' as constant ... ", false);
							if(checkName(name, "constant")) {
								isOK = false;
							}
							else if(currState == States.KS_STATE_COMPILE_FUNC) {
								errorMessage = "incomplete";
							}
							else {
								printMsg("[" + fileName + "] Define '" + name + "' as constant ... ", false);
								errorMessage = "must have an inline initialization of GREEN number or string";
							}
						}
						else {
							if(words[1].length == 1) {
								if(currState == States.KS_STATE_COMPILE_FUNC) {
									isOK = false;
									errorMessage = "incomplete";
								}
								else {
									currState = States.KS_STATE_COMPILE_CONST;
									printMsg("[" + fileName + "] Define '" + words[currCol] + "' as constant ... ", false);
									if(checkName(name, "constant")) {
										isOK = false;
									}
									else if(dictionaryObj[words[currCol]] != null) {
										isOK = false;
										errorMessage = "is already taken, please use another word";
									}
									else {
										// Define constant
										dictionaryObj[words[currCol]] = { addr: codeArray.length, const: true };
										isNewConst = true;
										newWordName =  words[currCol];
										newWordSE = "";
										newWordDesc = "";
										console.log("Define constant:", words[currCol], dictionaryObj);
									}
								}
							}
							else if(words[1].length == 2) {
								currPost = 1;
								if(currState == States.KS_STATE_COMPILE_FUNC) {
									isOK = false;
									errorMessage = "incomplete";
								}
								else {
									currState = States.KS_STATE_COMPILE_VAR;
									printMsg("[" + fileName + "] Define '" + words[currCol] + "' as variable ... ", false);
									if(checkName(name, "variable")) {
										isOK = false;
									}
									else if(dictionaryObj[words[currCol]] != null) {
										isOK = false;
										errorMessage = "is already taken, please use another word";
									}
									else {
										// Define variable
										dictionaryObj[words[currCol]] = { addr: codeArray.length };
										currDef = words[currCol];
										isNewVar = true;
										newWordName =  words[currCol];
										newWordSE = "";
										newWordDesc = "";
										console.log("Define variable:", words[currCol], dictionaryObj);
									}
								}
							}
							else {
								currPost = 2;
								if(currState == States.KS_STATE_COMPILE_FUNC) {
									printMsg("fall-through", true);
								}
								currState = States.KS_STATE_COMPILE_FUNC;
								printMsg("[" + fileName + "] Define '" + words[currCol] + "' as function ... ", false);
								isYellow = false;
								currREDword = words[currCol];
								currREDline = currRow + 1;
								if(checkName(name, "function")) {
									isOK = false;
								}
								else if(dictionaryObj[words[currCol]] != null) {
									isOK = false;
									errorMessage = "is already taken, please use another word";
								}
								else {
									// Define function
									dictionaryObj[words[currCol]] = codeArray.length;
									currDef = words[currCol];
									isNewFunc = true;
									newWordName =  words[currCol];
									newWordSE = "";
									newWordDesc = "";
									console.log("Define function:", words[currCol], dictionaryObj);
								}
							}
						}
					}
					else {
						// Unexpected
						isOK = false;
						errorMessage = "Unexpected!";
					}
				}
			}

			if(!isOK) {
				errorWord = words[currCol];
			}

			if(isFor) {
				isFor = false;
				forCol = currCol;
				forRow = currRow;
			}
			else if(isNext) {
				isNext = false;
				currCol = forCol;
				currRow = forRow;
			}

			if(isPause) {	
				saveCol = currCol;			
				break;
			}
		}		

		if(isOK && currState == States.KS_STATE_COMPILE_VAR) {
			if(dataStack.length > 0) {
				let d = dataStack.pop();
				if(isNaN(d)) {
					d = "\"" + d + "\"";
				}
				isOK = ksCompile(d);
			}
			else {
				// Error data stack is empty
				isOK = false;
				errorMessage = "did not left a number or string in the Data stack to initialize the VIOLET word";
				errorWord = words[words.length-1];
			}
		}

		if(isOK) {
			if(isNewFunc) {
				funcDesc_pushDesc(fileName, {name: newWordName, stackEffect: newWordSE, description: newWordDesc});
				isNewFunc = false;
			}
			else if(isNewVar) {
				funcDesc_pushDesc(fileName, {name: newWordName, stackEffect: "-- idx", description: newWordDesc});
				isNewVar = false;
			}
			else if(isNewConst) {
				funcDesc_pushDesc(fileName, {name: newWordName, stackEffect: "-- any", description: newWordDesc});
				isNewConst = false;
			}
		}

		if(!isOK) {
			errorLine = currRow + 1;
		}

		if(isPause) {
			savePre = currPre;
			savePost = currPost;
			saveisYellow = isYellow;
			saveREDword = currREDword;
			saveREDline = currREDline;
			saveDef = currDef;
			saveRow = currRow;			
			saveFullPath = fullPath;
			saveLines = lines;
			break;
		}
		else {
			initCol = 0;
		}
	}

	if(!isPause && isOK && currState == States.KS_STATE_COMPILE_FUNC) {
		isOK = false;
		errorMessage = "incomplete";
	}

	if(!isPause && !isOK) {
		if(errorMessage != "cancel") {

			if(currState == States.KS_STATE_INTERPRET) {
				outputChannel.append("[" + fileName + "] Executing ... ");
			}

			outputChannel.appendLine("Failed!");

			if(errorMessage == "incomplete") {
				outputChannel.appendLine("[" + fileName + "] Line " + currREDline + ": " + ColorTags[0][2] + " \'" + currREDword + "\' has an " + errorMessage + " definition");
			}
			else if(errorMessage.startsWith("is a number") || errorMessage.startsWith("is a string")) {
				outputChannel.appendLine("[" + fileName + "] Line " + errorLine + ": " + errorWord + " " + errorMessage);
			}
			else if(errorMessage.startsWith("string") || errorMessage.startsWith("is undefined") || errorMessage.startsWith("is already")) {
				outputChannel.appendLine("[" + fileName + "] Line " + errorLine + ": \'" + errorWord + "\' " + errorMessage);
			}
			else if(errorMessage.startsWith("BLUE") || errorMessage.startsWith("VIOLET") || errorMessage.startsWith("Unused") || errorMessage.startsWith("Unable to load") || errorMessage.startsWith("'for'")) {
				outputChannel.appendLine("[" + fileName + "] Line " + errorLine + ": " + errorMessage);
			}
			else {
				outputChannel.appendLine("[" + fileName + "] Line " + errorLine + ": " + ColorTags[currPre][currPost] + " \'" + errorWord + "\' " + errorMessage);
			}
		}
	}

	curFullPath.pop();
	return isOK;
}

async function executeWords() {
	await vscode.window.showInputBox({
		placeHolder: 'Type in the words to be executed'
	}).then(value => {
			if (value === undefined) {
				//throw new Error('cancelled');
			}
			else {
				// handle valid values
				//outputChannel.clear();
				printMsg("Executing ... ", true);

				const words = value.split(/(\s+)/);
				let isOK = true;
				let errorWord = "";

				errorMessage = "";

				for (let j = 0; isOK && j < words.length; j++) {
					if(words[j].length > 0 && words[j].trim().length != 0) {
						// Check if start with single quote
						if(words[j][0] == "'") {
							const res = getString(words, j, "'");
							
							if(res.isOK) {
								isOK = ksInterpret(res.str);
								j = res.j;
							}
							else {
								isOK = res.isOK;
								words[j] = res.str;
							}
						}
						// Check if start with double quote
						else if(words[j][0] == "\"") {
							const res = getString(words, j, "\"");

							if(res.isOK) {
								isOK = ksInterpret(res.str);
								j = res.j;
							}
							else {
								isOK = res.isOK;
								words[j] = res.str;
							}
						}
						else {
							// Interpret word
							isOK = ksInterpret(words[j]);
						}

						errorWord = words[j];
					}
				}

				if(!isOK) {
					outputChannel.appendLine("Failed!");
					outputChannel.appendLine("\'" + errorWord + "\' " + errorMessage);
				}
			}
		});  
}

function initBuiltInDesc() {
	let nameLen;
	let seffectLen;

	for (let i = 0; i < builtInDesc[0].details.length; i++) {		
		nameLen = builtInDesc[0].details[i].name.length;
		seffectLen = builtInDesc[0].details[i].stackEffect.length;
		
		if(builtInDesc[0].nameMaxLen < nameLen) {
			builtInDesc[0].nameMaxLen = nameLen;
		}

		if(builtInDesc[0].seffectMaxLen < seffectLen) {
			builtInDesc[0].seffectMaxLen = seffectLen;
		}		
	}
}

function showWords() {
	outputChannel.clear();
	outputChannel.appendLine("Note: any = either number OR string");
	outputChannel.appendLine("");

	for (let i = 0; i < funcDesc.length; i++) {
		if(funcDesc[i].details.length > 0) {
			outputChannel.appendLine("[" + funcDesc[i].name + "]");
			for (let j = 0; j < funcDesc[i].details.length; j++) {
				if(funcDesc[i].details[j].description.length > 0) {
					outputChannel.appendLine(funcDesc[i].details[j].name + " ".repeat(funcDesc[i].nameMaxLen - funcDesc[i].details[j].name.length) + "   | D: " + funcDesc[i].details[j].stackEffect + " ".repeat(funcDesc[i].seffectMaxLen - funcDesc[i].details[j].stackEffect.length) + "    where " + funcDesc[i].details[j].description);
				}
				else {
					outputChannel.appendLine(funcDesc[i].details[j].name + " ".repeat(funcDesc[i].nameMaxLen - funcDesc[i].details[j].name.length) + "   | D: " + funcDesc[i].details[j].stackEffect + " ".repeat(funcDesc[i].seffectMaxLen - funcDesc[i].details[j].stackEffect.length));
				}
				
			}
			outputChannel.appendLine("");
		}
	}
}

function funcDesc_pushTitle(title) {
	let isNew = true;

	for (let i = 0; i < funcDesc.length; i++) {
		if(funcDesc[i].name == title) {
			isNew = false;
			break;
		}
	}

	if(isNew) {
		funcDesc.push({	name: title,
			nameMaxLen: 0,
			seffectMaxLen: 0,
			details: []});
	}
}

function funcDesc_pushDesc(title, desc) {
	for (let i = 0; i < funcDesc.length; i++) {
		if(funcDesc[i].name == title) {
			const nameLen = desc.name.length;
			const seffectLen = desc.stackEffect.length;
			funcDesc[i].details.push(desc);
			
			if(funcDesc[i].nameMaxLen < nameLen) {
				funcDesc[i].nameMaxLen = nameLen;
			}

			if(funcDesc[i].seffectMaxLen < seffectLen) {
				funcDesc[i].seffectMaxLen = seffectLen;
			}
		}
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let LigthTheme = false;
	let ColorBlindMode = false;
	toggleTheme(LigthTheme, ColorBlindMode);
	initBuiltInDesc();
	dataStack.length = 0;
	returnStack.length = 0;
	dictionaryObj = { ...builtInFunc };
	funcDesc = [ ...builtInDesc ];
	outputChannel.show(true);
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "kolorScript" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let ks_loadFile = vscode.commands.registerCommand('kolorScript.loadFile', function () {
		// The code you place here will be executed every time your command is executed
		//const activeTextEditor = vscode.window.activeTextEditor;
		const { activeTextEditor } = vscode.window;
		if (!activeTextEditor) return;

		funcDesc = [ ...builtInDesc ];
		outputChannel.clear();
		codeArray.length = 0;
		dictionaryObj = { ...builtInFunc };
		fp = activeTextEditor.document.uri.fsPath;

		isVerbose = vscode.workspace.getConfiguration("kolorScript").get("verboseLoading");
		isPause = false;

		loadFile(activeTextEditor.document.getText().split(/\r?\n/), activeTextEditor.document.fileName);
	});

	let ks_toggleColorBlind = vscode.commands.registerCommand('kolorScript.toggleColorBlind', function () {
		ColorBlindMode = !ColorBlindMode;
		toggleTheme(LigthTheme, ColorBlindMode);
	});

	let ks_toggleLightTheme = vscode.commands.registerCommand('kolorScript.toggleLightTheme', function () {
		LigthTheme = !LigthTheme;
		toggleTheme(LigthTheme, ColorBlindMode);
	});

	let ks_executeWords = vscode.commands.registerCommand('kolorScript.executeWords', function () {
		executeWords();
	});

	let ks_showWords = vscode.commands.registerCommand('kolorScript.showWords', function () {
		showWords();
	});

	context.subscriptions.push(ks_loadFile);
	context.subscriptions.push(ks_toggleColorBlind);
	context.subscriptions.push(ks_toggleLightTheme);
	context.subscriptions.push(ks_executeWords);
	context.subscriptions.push(ks_showWords);
}

// This method is called when your extension is deactivated
function deactivate() {
	if(fdStack.length > 0) {
		fdStack.forEach(fd => {closeSync(fd.fid);});
	}
}

module.exports = {
	activate,
	deactivate
}
