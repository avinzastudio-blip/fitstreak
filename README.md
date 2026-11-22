# FitStreak — Workout Log & Daily Habit Tracker

## Project Overview

FitStreak is a responsive web application that helps users track workouts, monitor exercise duration, build healthy daily habits, and review their fitness progress.

The application uses HTML, CSS, JavaScript, and browser localStorage to save workout and habit data.

## Project Objectives

- Create a user-friendly fitness dashboard.
- Allow users to record workouts.
- Store exercise duration and workout dates.
- Allow users to edit and delete workouts.
- Track daily healthy habits.
- Display workout counts and habit progress.
- Calculate workout streaks.
- Filter workout history by date.
- Display total workout duration.
- Show weekly progress.
- Show recent habit history.
- Deploy the project using GitHub Pages.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Browser localStorage
- Google Fonts
- GitHub Pages

## Main Project Sections

### 1. Navigation Bar

The navigation bar contains links to:

- Dashboard
- Workouts
- Habits
- Progress

### 2. Hero Section

The hero section introduces FitStreak and contains:

- Project introduction
- Fitness motivation message
- Track a workout button

### 3. Dashboard Statistics

The dashboard displays:

- Today's workout count
- Daily habit completion
- Current workout streak

### 4. Workout Tracker

Users can:

- Add a workout.
- Enter an exercise name.
- Enter workout duration.
- Edit an existing workout.
- Delete an existing workout.
- Filter workouts by date.
- View all saved workouts.
- See total workout minutes.
- Save workout data in localStorage.

### 5. Daily Habits

The application includes three daily habits:

- Drink enough water
- Exercise for 20 minutes
- Sleep on time

The habit section displays:

- Completed habit count
- Total number of habits
- Completion progress bar
- Saved daily habit status

### 6. Weekly Progress

The weekly progress section displays:

- Total workouts for the current week.
- Total workout minutes.
- Total completed habits.
- Workout minutes for each day.
- A weekly workout progress chart.

### 7. Habit History

The habit history section displays:

- Today's habit progress.
- Previous days' habit progress.
- Completed habits out of total habits.
- The last seven days of habit activity.

### 8. Why FitStreak Section

This section explains the main benefits of FitStreak:

- Track progress
- Build healthy habits
- Stay motivated

### 9. How It Works Section

The application works through three simple steps:

1. Log your workout.
2. Complete your habits.
3. Keep your streak alive.

### 10. Green Call-to-Action Section

The final green section encourages users to start tracking their workouts and healthy habits.

## Workout Data Structure

Each workout is stored as an object:

```javascript
{
    exercise: "Running",
    duration: 30,
    date: "2026-11-22"
}