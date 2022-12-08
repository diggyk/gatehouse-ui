import { useEffect, useState } from "react";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

export default function useRoles(
  client: GatehousePromiseClient,
  setErrorMsg?: Function
) {
  const [roles, setRoles]: [string[], any] = useState([]);
  const [rolesIsError, setRolesIsError]: [null | string, any] = useState(null);
  useEffect(() => {
    let request = new proto.roles.GetRolesRequest();

    // Get all existing roles
    client
      .getRoles(request, null)
      .then((response: proto.roles.MultiRoleResponse) => {
        console.log("Loading roles...");
        let role_names: string[] = [];
        response.getRolesList().forEach((role: proto.roles.Role) => {
          role_names.push(role.getName());
        });
        setRoles(role_names);
        console.log("Loaded " + role_names.length + " roles");
      })
      .catch((err: Error) => {
        setRolesIsError(err.message);
        setErrorMsg?.(err.message);
      });
  }, []);

  return { roles, setRoles, rolesIsError };
}
