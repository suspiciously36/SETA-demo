import type React from "react";
import TeamList from "../components/teams/TeamList.tsx";
import UserManagementTable from "../components/users/UserManagementTable.tsx";

const DashboardPage: React.FC = () => {
  return (
    <div>
      <h1>Dashboard Page</h1>
      <p>Welcome to the dashboard!</p>
      <TeamList />
      <UserManagementTable />
    </div>
  );
};

export default DashboardPage;
