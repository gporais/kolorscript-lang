# <span style="color:red">**kolor**</span><span style="color:green">**Script**</span>

A modern variant of Charles H. Moore's [colorForth](https://colorforth.github.io/cf.htm) that uses ASCII for encoding and text files as storage to allow code sharing using modern repositories.

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
    ```
      "Hello world!"  .
    ```
    Or type:
    `<space><space>"Hello world!"<space><space>.`
3. Save and press F2 to load your code

    Result: 
    ![output-1](https://raw.githubusercontent.com/gporais/kolorscript-lang/master/images/screenshots/Output-1.gif)

4. Again, copy and paste the code below (including whitespaces)
    ```
    my-name   (--)    This function prints my name
     "My name is George!" . ;  my-name
    ```
    Or type:
    `my-name<space><space><space>(--)<space><space><space><space>This function prints my name<enter><space>"My name is George!"<space>.<space>;<space><space>my-name`
5. Save and press F2 to load your code

    Result:
    ![output-2](https://raw.githubusercontent.com/gporais/kolorscript-lang/master/images/screenshots/Output-2.gif)

IMPORTANT: Explicitly showing `<space>` when typing the code is due to prefix whitespaces are CRITICAL, for it defines the color of the word. Please make sure there are NO unused prefix whitespace anywhere in the file.

## Usage
### Running your code
Press `F2` OR press `F1` then type `kolor` and scroll to select `kolorScript: Load file`
![Load file](https://raw.githubusercontent.com/gporais/kolorscript-lang/master/images/screenshots/LoadFile.gif)
Please make sure the editor window with intended code has the focus.

### Execute some words
Press `F4` OR press `F1` then type `kolor` and scroll to select `kolorScript: Execute words`
![Execute words](https://raw.githubusercontent.com/gporais/kolorscript-lang/master/images/screenshots/ExecuteWords.gif)
Please make sure the words you plan to execute has already been loaded. This mechanism is like executing Forth words in a command line.

### Showing all the words
Press `F6` OR press `F1` then type `kolor` and scroll to select `kolorScript: Show words`
![Show words](https://raw.githubusercontent.com/gporais/kolorscript-lang/master/images/screenshots/ShowWords.gif)
This is a replacement and improvement for **`WORDS`** from Forth. It shows the stack-effect and brief description for BOTH built-in and user defined (after loading) words in the Output panel.

### Color blind theme
Press `F8` OR press `F1` then type `kolor` and scroll to select `kolorScript: Toggle Color Blind theme`
![Color Blind](https://raw.githubusercontent.com/gporais/kolorscript-lang/master/images/screenshots/ColorBlind.gif)
Where:

<span style="color:green">**GREEN**</span> words are kept as Normal text

<span style="color:gold">**YELLOW**</span> words are set to **Bold** text

<span style="color:gray">**GRAY**</span> words are set to *Italic* text

<span style="color:blue">**BLUE**</span> words are set to <u>Underlined</u> text

<span style="color:magenta">**MAGENTA**</span> words are set to <u>Underlined</u> text

<span style="color:red">**RED**</span> words are set to <u>Underlined</u> text

### Light theme
Press `F9` OR press `F1` then type `kolor` and scroll to select `kolorScript: Toggle Light theme`
![Light theme](https://raw.githubusercontent.com/gporais/kolorscript-lang/master/images/screenshots/LightTheme.gif)

TIP: Use the function keys for faster and convenient access.

## Settings
### Enable verbose loading
1. Go to `Extensions`, find `kolorScript` on the Installed list
2. Click setting icon of `kolorScript` extension and select `Extension Settings`
3. Check the `Show more details when loading` checkbox
4. Close `Settings` tab, click the editor window and press F2 
![Verbose loading](https://raw.githubusercontent.com/gporais/kolorscript-lang/master/images/screenshots/VerboseLoading.gif)

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

### <span style="color:green">**GREEN** means "COMPILE this word"</span>

Syntax: `<space>` <span style="color:green">word</span>

Description: 
* Are executed at run-time
* Used for initializing constants or defining functions

---

### <span style="color:gold">**YELLOW** means "INTERPRET this word"</span>

Syntax: `<space><space>` <span style="color:gold">word</span>

Description: 
* Are executed at compile-time
* Used for initializing variables or as macros

---

### <span style="color:gray">**GRAY** means "COMMENT out this word(s)"</span>

Syntax 1: `<space><space><space>` <span style="color:gray">word</span>

Syntax 2: `<space><space><space>` <span style="color:gray">(word1 word2 word3)</span>

Syntax 3: `<space><space><space><space>` <span style="color:gray">word1 word2 ... wordN</span>

Description:
* Syntax 1 is for commenting a single word
* Syntax 2 is for commenting a set of words
* Syntax 3 is for commenting all the words to the right

---

### <span style="color:blue">**BLUE** means "define a CONSTANT with this word as its name"</span>

Syntax: <span style="color:blue">word</span> `<space>` <span style="color:green">value</span>

Description:
* Are global in scope
* Only <span style="color:green">GREEN</span> Number or String is acceptable to initialize constants

Note:
* Should be one liner and focusing only for initializing the value
* After <span style="color:green">value</span> , comments (gray words) or macros (yellow words) can follow

---

### <span style="color:magenta">**MAGENTA** means "define a VARIABLE with this word as its name"</span>

Syntax: <span style="color:magenta">word</span> `<space><space>` <span style="color:gold">value and/or word(s)</span>

Description:
* Are global in scope
* Only <span style="color:gold">YELLOW</span> Number, String or Word(s) that leaves a value in the Data stack is acceptable to initialize variables

Note:
* Should be one liner and focusing only for initializing the value
* The top of Data stack before leaving the line is popped and becomes the value of the variable

---

### <span style="color:red">**RED** means "define a FUNCTION with this word as its name"</span>

Syntax 1: <span style="color:red">word</span> `<space><space><space>` <span style="color:gray">stack-effect</span> `<space>` <span style="color:green">value(s) and/or word(s) ;</span>

Syntax 2: <span style="color:red">word</span> `<space><space><space>` <span style="color:gray">(stack - effects)</span> `<space>` <span style="color:green">value(s) and/or word(s) ;</span>

Syntax 3: <span style="color:red">word</span> `<space><space><space><space>` <span style="color:gray">brief description</span> `<enter>`

`<space>` <span style="color:green">value(s) and/or word(s) ;</span>

Syntax 4: <span style="color:red">word</span> `<space><space><space>` <span style="color:gray">(stack - effects)</span> `<space><space><space><space>` <span style="color:gray">brief description</span> `<enter>`

`<space>` <span style="color:green">value(s) and/or word(s) ;</span>

Description:
* <span style="color:green">GREEN</span> Number, String or Word(s) is used to define the function
* <span style="color:gold">YELLOW</span> Word is fully recommended when utilizing constants and variables within function definition, this is for readability and performance
* <span style="color:green">GREEN</span> semi-colon ( <span style="color:green">**;**</span> ) is used for closing function definition

Note:
* Transition of <span style="color:gold">YELLOW</span> to <span style="color:green">GREEN</span> word within function definition will have the top of Data stack popped and compiled as literal, this mechanism is useful for handling constants and variables within function definition
* Comments inline with the function name is used when `Showing all the words` by pressing `F6`, so Syntax 4 is fully recommended

---

**WHITE** (for dark theme) or **BLACK** (for light theme)  means "this word has INVALID format"

Syntax: Applicable to all patterns

Description:
* If a Number or a String is used as name for defining a new word
* If a Word has a combination of characters not recognized by internal regex (Please inform me for this case)

---

## Reference
(Link to be followed)

## Examples
(Link to be followed)

## Release Notes

### 1.0.0

Initial release of kolorScript

### 1.0.1

Fixed README.md to consider Marketplace markdown

### 1.1.0

* Added 12 new words (including http-get and http-post)
* Bug fixes

### 1.1.1

* Fix on path normalization for 'load' and 'open-file'

### 1.1.2

* Added: round, time12H, time24H, floor, padStart, padEnd
* Fixed: open-file, split-str
* Improved: if, -if, to-str
* Variables can store multiple values

### 1.1.3

* Added: overwrite, lb<, lb

### 1.1.4

* Added: writeAt, cr
* Improved: read-line, .
* Handler for F2 while running

### 1.1.5

* Added: strLen, lbLen
* Renamed & improved: read-line, split-str
* New feature: Go to definition (still work in progress)

### 1.1.6

* Added: nop short-timestamp medium-timestamp long-timestamp
* Renamed: lb< lbLen strLen lb readLine writeAt padStart padEnd splitStr
* Removed: timestamp

### 1.1.7
* Improved http-get
* Improved go to definition
* Improved syntax regex
---
