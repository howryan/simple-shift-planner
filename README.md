# Simple Shift Planner
The Simple Shift Planner is a project I used as starting point to get used to Angular and all associated technologies. 
The idea was to create a simple application for very small companies or departments to plan their shifts 

**Features:**
* A time table which contains name-weekday-relations with associated shifts
* Names and shifts can be loaded, edited and removed within comma separated string lists
* All entered data is stored inside the local storage of the current browser
* A week plan can easily be export in a JSON string and imported on another device or browser 
* The number of different shifts per day are listed below the plan to get an improved overview
* Sortable columns (name and shift)
* Download a week plan as screenshot via button (needs improvements)
* Simple design with Bootstrap 4
* Optimized frontend for printing: white background and black or dark grey text

**Live demo & test data:**
* The latest version of the project is published at https://howryan.github.io/simple-shift-planner/
* Test data can be imported/inserted in the side menu of the running web application
* Test data for names:
    * `Max, Erika, John, Jane`
* Test data for shifts:
    * `05:45-14:00,12:00-20:30,Vacation,School`

**ToDos:**
* Replace hard coded public holidays by integrating an input field which stores the public holidays like the names and time ranges in the local storage
* Replace hard coded german words and texts by the angular localization feature
* Add an extra column where the number of hours for every person is calculated
* Add input restrictions for shifts and names
* Several refactorings
* Enhance UI

---
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# Deploying the application on GitHub Pages
ng build --prod --base-href https://howryan.github.io/simple-shift-planner/

ngh --dir=dist/
