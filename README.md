# User and Team Management Dashboard

## Project Overview

This project is a comprehensive User and Team Management system designed primarily for users in a "Manager" role. It provides a frontend interface to interact with backend services for managing users, their roles, team formations, and authentication. The application features a role-based access control (RBAC) system, allowing different levels of functionality based on whether the user is a member, manager, or root administrator. It also features a Folders/Notes creation/edition as well as sharing theirs accessibility among users while respecting permission level of read or write.

## Technologies Used

### Backend

    Runtime/Framework: Node.js with NestJS

    Language: TypeScript

    Database: PostgreSQL

    Query Builder/ORM: Knex.js

    API Styles:

        - RESTful APIs (primarily for RBAC and team management)

        - GraphQL APIs with Postgraphile (primarily for user authentication)

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

        - AccessToken: Short-lived token for accessing protected resources ()

        - RefreshToken Rotation: Securely manages refresh tokens (stored server-side in the database,
        and an HTTP-Only cookie is used for the refresh token itself) to obtain new access tokens
        without requiring users to log in repeatedly.
        The backend handles clearing the HTTP-Only cookie on logout.

**2. User Interface & Experience**

    Dashboard Layout:

        - Fixed sidebar for main navigation (e.g., User Management, Team Management, My Folders, Shared Folders).

        - Main content area with tabbed navigation to switch between User, Manager, Team, My Folders, Shared Folders views.

        - Tab labels display live counts of entities (e.g., "User | 69", "Team | 45").

    User Management Page:

        - Displays a table of users with details such as avatar, name, email, user ID/handle, role, associated teams (as colored chips), and status.

        - Includes action menus for each user (e.g., delete user), accessible based on RBAC.

        - Pagination: The user table supports pagination to efficiently handle large numbers of users.

        - "+ New User" button for creating users (visible to managers/root).

        - See User Assets by clicking on "View assets" button (accessible for that user or their manager).

    Team Management Page:

        - Displays a list of teams, likely in a card-based layout.

        - Each card shows team name, member/manager counts, and a preview of member/manager avatars.

        - Includes actions on each team card (e.g., edit, delete), accessible based on RBAC.

        - Lazy Loading: The team list implements lazy loading (infinite scroll) to efficiently handle a large number of teams.

        - "+ New Team" button for creating teams (visible to managers/root).

        - See "Team Assets" by clicking on each team card (available for manager of the team only).

    Modals for Create/Edit Operations:

        - User-friendly modals for creating and editing users and teams.

        - Team creation/editing modals feature user selection with search functionality to add members and managers.

    My Folders:

        - Contains self-created folders (Fast create "+" button on the sidebar, options for showing numbered items on the sidebar).

        - Editable Folder Name && Description (editable for owner or users with shared "write" access level).

        - Create notes inside the folder by clicking on button on the sidebar or "+ New Note" in the folder page (editable for owner or users with shared "write" access level).

        - Share folder feature (Choose people to share to with access level of "write" or "read").

    Modal for Folder sharing feature:

        - Choose people to share with, choose access level (read/write).

        - Currently share with users list with Revoke button to revoke folders accessibility.

    Shared Folders:

        - Contains folders that are shared by other users.

        - Accessibility is depended on access level that the others give you when they share.

    Notes (inside Folders):

        - Are shared implicitly when sharing folders that contain its notes (Accessibility is depended on folders access level).

        - Title/Body is editable (live content update).

        - Tags are add-able.

    Team/User Assets:

        - Pagination: The assets table supports pagination to efficiently handle large numbers of folders/notes displayed.

    Notifications:

        - Toast/Snackbar notifications for feedback on actions (e.g., success or failure of create, edit, delete operations).

**3. Role-Based Access Control (RBAC - RESTful APIs)**

The application enforces different permissions based on user roles:

    Member Role:

        - View-only access to certain information (details to be specified, typically cannot perform management actions).

    Manager/Root Role (Manageability):

        - User Management:

            1. Create new users (can assign roles: 'member' or 'manager').

            2. Delete users from the system.

            3. View user list with pagination.

        - User Assets:

            1. View user assets (See all folders and notes owned by or shared with a specific user) - Accessible to the user or their manager.

        - Team Management:

            1. Create new teams.

            2. Edit existing team formations:

                - Add members and managers to a team.

                - Remove members and managers from a team (only the main manager of a team or a root user can remove other managers from that team).

                - Edit team name.

                - Delete teams, view team list with lazy loading.

        - Team Assets:

            1. View team assets (See all folders and notes accessible to members of the team) - Only accessible to managers of the team.

        - In Folders/Notes feature:

            1. Only authenticated users can create/read/update/delete.

            2. Owners manage sharing.

            3. Managers can view (not modify) all assets of users in their team.

            4. Shared access must respect permission level (read or write).

_Project Status_

    Core authentication and RBAC logic is in place.

    Frontend components for User and Team listing, creation, and editing are being actively developed and refined.

    UI styling is being updated to match design mockups using MUI.

- Database Table Design: https://dbdiagram.io/d/Management-dashboard-68220b965b2fc4582f3cb992
