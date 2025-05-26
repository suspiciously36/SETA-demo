# User and Team Management Dashboard

## Project Overview

This project is a comprehensive User and Team Management system designed primarily for users in a "Manager" role. It provides a frontend interface to interact with backend services for managing users, their roles, team formations, and authentication. The application features a role-based access control (RBAC) system, allowing different levels of functionality based on whether the user is a member, manager, or root administrator.

## Technologies Used

### Backend

    Runtime/Framework: Node.js with NestJS

    Language: TypeScript

    Database: PostgreSQL

    Query Builder/ORM: Knex.js

    API Styles:

        RESTful APIs (primarily for RBAC and team management)

        GraphQL APIs with Postgraphile (primarily for user authentication)

### Frontend

    Framework/Library: React.js (with Vite for tooling)

    Language: TypeScript

    State Management: Redux (legacy, not Redux Toolkit)

    UI Library: MUI (Material-UI)

    HTTP Client: Axios

### Core Features

**1. Authentication (GraphQL APIs)**

    Login/Logout: Secure user login and logout mechanisms.

    JWT Strategy: Implements JSON Web Tokens for authentication.

        AccessToken: Short-lived token for accessing protected resources ()

        RefreshToken Rotation: Securely manages refresh tokens (stored server-side in the database,
        and an HTTP-Only cookie is used for the refresh token itself) to obtain new access tokens
        without requiring users to log in repeatedly.
        The backend handles clearing the HTTP-Only cookie on logout.

**2. User Interface & Experience**

    Dashboard Layout:

        Fixed sidebar for main navigation (e.g., User Management, Team Management, Profile, Settings).

        Main content area with tabbed navigation to switch between User, Manager, and Team views.

        Tab labels display live counts of entities (e.g., "User | 3953", "Team | 45").

    User Management Page:

        Displays a table of users with details such as avatar, name, email, user ID/handle, role, associated teams (as colored chips), and status.

        Includes action menus for each user (e.g., delete user), accessible based on RBAC.

        Pagination: The user table supports pagination to efficiently handle large numbers of users.

        "+ New User" button for creating users (visible to managers/root).

    Team Management Page:

        Displays a list of teams, likely in a card-based layout.

        Each card shows team name, member/manager counts, and a preview of member/manager avatars.

        Includes actions on each team card (e.g., edit, delete), accessible based on RBAC.

        Lazy Loading: The team list implements lazy loading (infinite scroll) to efficiently handle a large number of teams.

        "+ New Team" button for creating teams (visible to managers/root).

    Modals for Create/Edit Operations:

        User-friendly modals for creating and editing users and teams.

        Team creation/editing modals feature user selection with search functionality to add members and managers.

    Notifications:

        Toast/Snackbar notifications for feedback on actions (e.g., success or failure of create, edit, delete operations).

**3. Role-Based Access Control (RBAC - RESTful APIs)**

The application enforces different permissions based on user roles:

    Member Role:

        View-only access to certain information (details to be specified, typically cannot perform management actions).

    Manager/Root Role (Manageability):

        User Management:

            Create new users (can assign roles: 'member' or 'manager').

            Delete users from the system.

            View user list with pagination.

        Team Management:

            Create new teams.

            Edit existing team formations:

                Add members and managers to a team.

                Remove members and managers from a team (only the main manager of a team or a root user can remove other managers from that team).

                Edit team name.

                Delete teams, view team list with lazy loading.

_Project Status_

    Core authentication and RBAC logic is in place.

    Frontend components for User and Team listing, creation, and editing are being actively developed and refined.

    UI styling is being updated to match design mockups using MUI.

- Database Table Design: https://dbdiagram.io/d/Management-dashboard-68220b965b2fc4582f3cb992
