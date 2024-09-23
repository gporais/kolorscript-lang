# Change Log

All notable changes to the "kolorscript-lang" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.10] - 2024-09-23

- Added: >= <=

## [1.1.9] - 2024-09-19

- Add trim to split-str
- Fix read-line
- Fix syntax regex

## [1.1.8] - 2024-09-17

### Fixed

- http-get

## [1.1.7] - 2024-09-17

### Improved

- http-get
- go to definition
- syntax regex

## [1.1.6] - 2024-09-08

### Added

- nop short-timestamp medium-timestamp long-timestamp

### Renamed

- lb< lbLen strLen lb readLine writeAt padStart padEnd splitStr

### Removed

- timestamp

## [1.1.5] - 2024-09-02

### Added

- strLen, lbLen
- Go to definition (still work in progress)

### Improved

- read-line
- split-str

### Renamed

- read-line to readLine
- split-str to splitStr

## [1.1.4] - 2024-08-30

### Added

- writeAt, cr

### Improved

- read-line, .
- Handler for F2 while running

## [1.1.3] - 2024-08-29

### Added

- overwrite, lb<, lb

## [1.1.2] - 2024-08-23

### Added

- round, time12H, time24H, floor, padStart, padEnd

### Fixed

- open-file, split-str

### Improved

- if, -if, to-str
- Variables can store multiple values

## [1.1.1] - 2024-08-16

### Fixed

- Fix on path normalization for 'load' and 'open-file'

## [1.1.0] - 2024-08-05

- Added 12 new words (including http-get and http-post)
- Bug fixes

## [1.0.1] - 2024-06-21

### Fixed

- Fix README.md to consider Marketplace markdown 

## [1.0.0] - 2024-06-14

- Initial release