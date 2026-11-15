# FitStreak — Workout Log & Daily Habit Tracker

## Project Overview

FitStreak is a responsive web application that helps users record workouts, track exercise duration, build healthy habits, and monitor daily progress.

The project is built using HTML, CSS, JavaScript, and browser localStorage.

## Project Objectives

- Create a user-friendly fitness dashboard.
- Allow users to record workouts and exercise duration.
- Allow users to edit and delete workouts.
- Help users track daily healthy habits.
- Display workout counts and habit completion progress.
- Calculate workout streaks.
- Filter workout history by date.
- Display total workout duration.
- Store data in the browser using localStorage.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Browser localStorage
- Google Fonts

## Main Sections

### Navigation Bar

The navigation bar contains links to:

- Dashboard
- Workouts
- Habits

### Hero Section

The hero section introduces FitStreak and contains a button that takes the user to the workout tracker.

### Dashboard Statistics

The dashboard displays:

- Today's workout count
- Daily habit progress
- Current workout streak

### Workout Tracker

Users can:

- Enter an exercise name.
- Enter workout duration.
- Add a new workout.
- Edit an existing workout.
- Delete a workout.
- View workouts by date.
- View all saved workouts.
- See the total workout minutes for the selected view.

### Daily Habits

The habit section contains three daily habits:

- Drink enough water
- Exercise for 20 minutes
- Sleep on time

The application displays:

- Completed habit count
- Habit completion percentage
- Progress bar
- Saved habit status

### Why FitStreak Section

This section explains the main benefits of the application:

- Track progress
- Build healthy habits
- Stay motivated

### How It Works Section

The application workflow is divided into three steps:

1. Log your workout.
2. Complete your habits.
3. Keep your streak alive.

### Green Call-to-Action Section

The final call-to-action section encourages users to start tracking their workouts and habits.

## Workout Data Structure

Each workout is stored as an object:

```javascript
{
    exercise: "Running",
    duration: 30,
    date: "2026-11-15"
}