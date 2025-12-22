import ProjectList from "../../components/tables/lists/projectList";
import { useGetCurrentUserQuery } from "../../redux/services/authApi";

export default function Project() {
  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();

  const id = loggedUser?.user?.institute?.institute_id;

  return (
    <>
      <ProjectList insistitute_id={id || ""} userType="external_user" />
    </>
  );
}
