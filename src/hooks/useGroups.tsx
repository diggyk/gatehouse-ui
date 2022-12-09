import { useEffect, useState } from "react";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

export default function useGroups(
  client: GatehousePromiseClient,
  params: { setErrorMsg?: Function; setLoading?: Function }
) {
  const [groups, setGroups] = useState(new Map<string, proto.groups.Group>());
  const [groupsAbbr, setGroupsAbbr]: [string[], any] = useState([]);
  const [groupsIsError, setError]: [string | null, any] = useState(null);

  useEffect(() => {
    let request = new proto.groups.GetGroupsRequest();
    let grp_map = new Map<string, proto.groups.Group>();
    let grps: string[] = [];

    client
      .getGroups(request, null)
      .then((response) => {
        response.getGroupsList().forEach((group: proto.groups.Group) => {
          grp_map.set(group.getName(), group);
          grps.push(group.getName());
        });
        setGroups(grp_map);
        setGroupsAbbr(grps);
        params.setLoading?.(false);
      })
      .catch((err) => {
        console.error(err.message);
        setError(err.message);
        params.setErrorMsg?.(err.message);
      });
  }, []);

  return {
    groups,
    groupsAbbr,
    setGroups,
    groupsIsError,
  };
}
