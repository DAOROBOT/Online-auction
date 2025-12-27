import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="app-container">
        <Outlet />
    </div>
  );
};

export default AdminLayout;