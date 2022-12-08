import { useEffect, useState } from "react";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

export default function useRoles(
  client: GatehousePromiseClient,
  params: { setErrorMsg?: Function }
) {
  const [roles, setRoles]: [Map<string, proto.roles.Role>, any] = useState(
    new Map<string, proto.roles.Role>()
  );
  const [rolesAbbr, setRolesAbbr]: [string[], any] = useState([]);
  const [rolesIsError, setRolesIsError]: [null | string, any] = useState(null);

  useEffect(() => {
    let request = new proto.roles.GetRolesRequest();

    // Get all existing roles
    client
      .getRoles(request, null)
      .then((response: proto.roles.MultiRoleResponse) => {
        let roles = new Map<string, proto.roles.Role>();
        let role_names: string[] = [];
        response.getRolesList().forEach((role: proto.roles.Role) => {
          roles.set(role.getName(), role);
          role_names.push(role.getName());
        });
        setRoles(roles);
        setRolesAbbr(role_names);

        console.log("Loaded " + role_names.length + " roles");
      })
      .catch((err: Error) => {
        console.error(err.message);
        setRolesIsError(err.message);
        params.setErrorMsg?.(err.message);
      });
  }, []);

  return { roles, setRoles, rolesAbbr, setRolesAbbr, rolesIsError };
}
