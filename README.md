# ${\textsf{\color{red}kolor\color{green}Script}}$

A modern variant of [colorForth](https://colorforth.github.io/cf.htm) that uses ASCII for encoding and text files as storage to allow code sharing using modern repositories.

Just in case, here is a good reference for Forth programming: [Starting Forth](https://www.forth.com/wp-content/uploads/2018/01/Starting-FORTH.pdf)

## Features

* 50 built-in Forth words
* Color blind mode
* Your script will run on all three major OS (Mac/Win/Linux) with 100% NO modifications needed! Even path separators and EOL will be kept as it is

## Installation

1. Download and install [Visual Studio Code](https://code.visualstudio.com/download) on your preferred OS
2. Open Visual Studio Code and go to `Extensions`
3. Type `kolorScript` in the search box, then click `Install`

## Quick start

1. Create new file and name it `test.ks`
2. Copy and paste the code below (including whitespaces)

    >${\texttt{\color{gold}\space\space"Hello world!"\space\space.}}$

    Or type:

    `<space><space>"Hello world!"<space><space>.`

3. Save and press F2 to load your code

    Result: 
![output-1](https://github.com/gporais/kolorscript-lang/blob/master/images/screenshots/Output-1.gif)

4. Again, copy and paste the code below (including whitespaces)
    >${\texttt{\color{red}my-name\space\space\space\color{gray}(--)\space\space\space\space This function prints my name}}\newline\texttt{\color{green}\space"My name is George!"\space.\space;\space\space\color{gold}my-name}$

    Or type:

    `my-name<space><space><space>(--)<space><space><space><space>This function prints my name<enter><space>"My name is George!"<space>.<space>;<space><space>my-name`

5. Save and press F2 to load your code

    Result:
![output-2](https://github.com/gporais/kolorscript-lang/blob/master/images/screenshots/Output-2.gif)

> [!IMPORTANT]
> Explicitly showing `<space>` when typing the code is due to prefix whitespaces are CRITICAL, for it defines the color of the word. Please make sure there are NO unused prefix whitespace anywhere in the file.

## Usage
### Running your code
Press `F2` OR press `F1` then type `kolor` and scroll to select `kolorScript: Load file`
![Load file](https://github.com/gporais/kolorscript-lang/blob/master/images/screenshots/LoadFile.gif)
Please make sure the editor window with intended code has the focus.

### Execute some words
Press `F4` OR press `F1` then type `kolor` and scroll to select `kolorScript: Execute words`
![Execute words](https://github.com/gporais/kolorscript-lang/blob/master/images/screenshots/ExecuteWords.gif)
Please make sure the words you plan to execute has already been loaded. This mechanism is like executing Forth words in a command line.

### Showing all the words
Press `F6` OR press `F1` then type `kolor` and scroll to select `kolorScript: Show words`
![Show words](https://github.com/gporais/kolorscript-lang/blob/master/images/screenshots/ShowWords.gif)
This is a replacement and improvement for **`WORDS`** from Forth. It shows the stack-effect and bried description for BOTH built-in and user defined (after loading) words in the Output panel.

### Color blind theme
Press `F8` OR press `F1` then type `kolor` and scroll to select `kolorScript: Toggle Color Blind theme`
![Color Blind](https://github.com/gporais/kolorscript-lang/blob/master/images/screenshots/ColorBlind.gif)
Where:

${\texttt{\color{green}GREEN}}$ is kept as Normal text

${\texttt{\color{gold}YELLOW}}$ is set to **Bold** text

${\texttt{\color{gray}GRAY}}$ is set to *Italic* text

${\texttt{\color{blue}BLUE \color{magenta}MAGENTA \color{red}RED}}$ are set to Underlined text

### Light theme
Press `F9` OR press `F1` then type `kolor` and scroll to select `kolorScript: Toggle Light theme`
![Light theme](https://github.com/gporais/kolorscript-lang/blob/master/images/screenshots/LightTheme.gif)

> [!TIP]
> Use the function keys for faster and convenient access.

## Settings
### Enable verbose loading
1. Go to `Extensions`, find `kolorScript` on the Installed list
2. Click setting icon of `kolorScript` extension and select `Extension Settings`
3. Check the `Show more details when loading` checkbox
4. Close `Settings` tab, click the editor window and press F2 
![Verbose loading](https://github.com/gporais/kolorscript-lang/blob/master/images/screenshots/VerboseLoading.gif)

## Coding guidelines
### General Information
* There only three types: Number, String, or a Word
* Numbers are written as signed integer, hexadecimal, or float
* Strings must be enclosed with single or double quote
* Words are built-in functions or user-defined functions/variables/constants
* Executing a Number will push the that Number to Data stack
* Executing a String will push that String to Data stack
* Executing a Word (function) will call the function
* Executing a Word (variable) will push an index to Data stack to be used by `@` and `!`
* Executing a Word (constant) will push the value to Data stack

---

### ${\texttt{\color{green}GREEN means "COMPILE this word"}}$
Syntax: `<space>`${\texttt{\color{green}word}}$

Description: 
* Are executed at run-time
* Used for initializing constants or defining functions

---

### ${\texttt{\color{gold}YELLOW means "INTERPRET this word"}}$
Syntax: `<space><space>`${\texttt{\color{gold}word}}$

Description: 
* Are executed at compile-time
* Used for initializing variables or as macros

---

### ${\texttt{\color{gray}GRAY means "COMMENT out this word(s)"}}$
Syntax 1: `<space><space><space>`${\texttt{\color{gray}word}}$

Syntax 2: `<space><space><space>`${\texttt{\color{gray}(word1 word2 word3)}}$

Syntax 3: `<space><space><space><space>`${\texttt{\color{gray}word1 word2 ... wordN}}$

Description:
* Syntax 1 is for commenting a single word
* Syntax 2 is for commenting a set of words
* Syntax 3 is for commenting all the words to the right

---

### ${\texttt{\color{blue}BLUE means "define a CONSTANT with this word as its name"}}$
Syntax: ${\texttt{\color{blue}word}}$`<space>`${\texttt{\color{green}value}}$

Description:
* Are global in scope
* Only ${\texttt{\color{green}green}}$ Number or String is acceptable to initialize constants

---

### ${\texttt{\color{magenta}MAGENTA means "define a VARIABLE with this word as its name"}}$
Syntax: ${\texttt{\color{magenta}word}}$`<space><space>`${\texttt{\color{gold}value and/or word(s)}}$

Description:
* Are global in scope
* Only ${\texttt{\color{gold}yellow}}$ Number, String or Word(s) that leaves a value in the Data stack is acceptable to initialize variables

Note: The top of Data stack before leaving the line is popped and becomes the value of the variable

---

### ${\texttt{\color{red}RED means "define a FUNCTION with this word as its name"}}$
Syntax 1: ${\texttt{\color{red}word}}$`<space><space><space>`${\texttt{\color{gray}stack-effect}}$`<space>`${\texttt{\color{green}value(s) and/or word(s) ;}}$

Syntax 2: ${\texttt{\color{red}word}}$`<space><space><space>`${\texttt{\color{gray}(stack - effects)}}$`<space>`${\texttt{\color{green}value(s) and/or word(s) ;}}$

Syntax 3: ${\texttt{\color{red}word}}$`<space><space><space><space>`${\texttt{\color{gray}brief description}}$

`<space>`${\texttt{\color{green}value(s) and/or word(s) ;}}$

Syntax 4: ${\texttt{\color{red}word}}$`<space><space><space>`${\texttt{\color{gray}(stack - effects)}}$`<space><space><space><space>`${\texttt{\color{gray}brief description}}$

`<space>`${\texttt{\color{green}value(s) and/or word(s) ;}}$

Description:
* ${\texttt{\color{green}green}}$ Number, String or Word(s) is used to define the function
* ${\texttt{\color{gold}yellow}}$ Word is fully recommended when utilizing constants and variables within function definition, this is for readbility and performance
* ${\texttt{\color{green};}}$ is also used for closing function definition

Note:
* Transition of ${\texttt{\color{gold}yellow}}$ to ${\texttt{\color{green}green}}$ word within function definition will have the top of Data stack popped and compiled as literal, this mechanism is useful for handling constants and variables within function definition
* Comments inline with the function name is used when `Showing all the words` by pressing `F6`, so Syntax 4 is fully recommended

---

### ${\texttt{\color{white}WHITE means "this word has INVALID format"}}$
Syntax: Applicable to all patterns

Description:
* If a Number or a String is used as name for defining a new word
* If a Word has a combination of characters not recognized by internal regex (Please inform me for this case)

---

## Built-in words dictionary
(Link to be followed)

## Sample codes
(Link to be followed)

## To be implemented
* Arrays
* Inputs: get-num, get-str 
* Files: write-line, path normalization
* HTTP: Basic server and client

## Release Notes

### 1.0.0

Initial release of kolorScript

---
