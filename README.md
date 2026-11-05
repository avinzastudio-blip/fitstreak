# FitStreak — Workout Log & Daily Habit Tracker

## Project Overview
FitStreak is a simple and responsive web application that helps users track their workouts and build healthy daily habits.

## Project Objectives
- Create a user-friendly fitness dashboard.
- Allow users to record their workouts and exercise duration.
- Help users track daily habits.
- Display workout counts and habit completion progress.
- Store workout data in the browser using localStorage.

## Technologies Used
- HTML5 — page structure
- CSS3 — styling and responsive design
- JavaScript — interactive functionality
- Browser localStorage — saving workout data

## Current Features
- Responsive navigation bar
- Welcome section and dashboard summary cards
- Workout entry form
- Workout list and workout counter
- Daily habit checklist
- Habit completion counter
- Basic hover effects and responsive styling

## Data Structure Planning

### Workout Data
Each workout will contain:
- Exercise name
- Duration in minutes
- Workout date

### Habit Data
Each habit record will contain:
- Habit name
- Completion status
- Date

## Week 1 — Module 1 Progress
- Created the project folder and files.
- Built the initial dashboard UI.
- Styled the dashboard using CSS.
- Implemented basic workout submission.
- Tested the workout counter and habit checklist.
- Planned the data fields for workouts and habits.
Implemented workout data persistence using localStorage.
Added workout dates to saved records.
Implemented daily habit state persistence.
Tested workout submission, habit counters, and page refresh behavior.
## Next Steps
- Improve data organization.
- Plan persistent storage for daily habits.
- Test the application and improve the user experience.

## Week 2 — Module 2 Progress
- Added workout input validation.
- Added workout editing and deletion.
- Added workout streak calculation.
- Improved workout and habit progress updates.
- Tested editing, deleting, validation, streaks, and localStorage behavior.

## Week 3 — Module 3 Progress
- Added workout history filtering by date.
- Added an option to view all saved workouts.
- Added total workout duration for the selected view.
- Updated the activity heading based on the selected date.
- Preserved existing workout, habit, edit, delete, and streak features.

## Next Steps
- Add weekly or monthly progress charts.
- Add a longer-term habit history view.
- Improve accessibility and test on different screen sizes.

## Testing Completed

- Added valid workout records.
- Checked empty exercise and invalid duration validation.
- Edited and deleted existing workouts.
- Refreshed the page to confirm saved data remains available.
- Checked daily habit progress and persistence.
- Tested workout streak calculation.
- Tested date filtering and the “Show all” option.
- Checked total workout minutes.
- Tested the landing page on smaller screen sizes.
- Checked the browser console for JavaScript errors.

## Project Limitations

- Data is currently stored only in the browser using localStorage.
- Habit history is currently focused on the current day.
- No user accounts or backend database have been added.
- No external API is currently connected.

## Future Improvements

- Add weekly and monthly progress charts.
- Add long-term habit history.
- Add user accounts and a backend database.
- Connect the application to a REST API.
- Add dark mode.
- Improve accessibility testing.
- Add customizable habits and workout categories.

## How to Run the Project

1. Open the FitStreak project folder.
2. Open `index.html` in a web browser.
3. Add workouts and complete daily habits.
4. Refresh the page to verify localStorage persistence.

## Conclusion

FitStreak provides a simple fitness dashboard for recording workouts and tracking daily habits. The project includes workout CRUD operations, persistent browser storage, progress calculations, date-based history, and an extended landing page.
