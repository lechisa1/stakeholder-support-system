import { useAuth } from "../../contexts/AuthContext";
import ExternalDashboard from "./ExternalDashboard";
import InternalDashboard from "./InternalDashboard";

function Home() {
  const { user } = useAuth();
  console.log("Logged in user:", user);

  // No user → render nothing
  if (!user) return null;

  if (user.user_type === "internal_user") {
    return <InternalDashboard />;
  }

  if (user.user_type === "external_user") {
    return <ExternalDashboard />;
  }

  // Fallback for unexpected user types
  return null;
}

export default Home;
