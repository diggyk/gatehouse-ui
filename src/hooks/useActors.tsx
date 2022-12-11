import { useEffect, useState } from "react";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

export default function useActors(
  client: GatehousePromiseClient,
  params?: {
    setErrorMsg?: Function;
    group?: proto.groups.Group;
    setLoading?: Function;
  }
) {
  const [actors, setActors]: [
    Map<string, Map<string, proto.actors.Actor>>,
    any
  ] = useState(new Map());
  const [actorsAbbr, setActorsAbbr]: [Set<string>, any] = useState(new Set());
  const [activeMembers, setActiveMembers]: [Map<string, Set<string>>, any] =
    useState(new Map());
  const [inactiveMembers, setInactiveMembers]: [Map<string, Set<string>>, any] =
    useState(new Map());
  const [actorsIsError, setIsError]: [string | null, any] = useState(null);

  useEffect(() => {
    // if a group is given, sort actors into active and inactive buckets
    let active_map = new Map<string, Set<string>>();
    params?.group?.getMembersList().forEach((member) => {
      let typestr = member.getTypestr();
      let name = member.getName();

      if (!active_map.has(typestr)) {
        active_map.set(typestr, new Set());
      }
      active_map.get(typestr)?.add(name);
    });
    setActiveMembers(active_map);

    // Get all existing known actors
    let request = new proto.actors.GetActorsRequest();
    client
      .getActors(request, null)
      .then((response) => {
        let known_actors_set = new Set<string>();
        let known_actors_map = new Map<
          string,
          Map<string, proto.actors.Actor>
        >();
        let inactive_map = new Map<string, Set<string>>();
        let actors = response.getActorsList();

        console.log("Loaded " + actors.length + " actors");

        actors.forEach((entity: proto.actors.Actor) => {
          let typestr = entity.getTypestr();
          let name = entity.getName();

          known_actors_set.add(typestr + ":" + name);
          if (!known_actors_map.has(typestr)) {
            known_actors_map.set(typestr, new Map());
          }
          known_actors_map.get(typestr)?.set(name, entity);

          if (!active_map.get(typestr)?.has(name)) {
            if (!inactive_map.has(typestr)) {
              inactive_map.set(typestr, new Set());
            }
            inactive_map.get(typestr)?.add(name);
          }
        });
        setActors(known_actors_map);
        setActorsAbbr(known_actors_set);
        setInactiveMembers(new Map(inactive_map));
        params?.setLoading?.(false);
      })
      .catch((err) => {
        console.error(err.message);
        setIsError(err.message);
        params?.setErrorMsg?.(err.message);
      });
  }, []);

  return {
    actors,
    setActors,
    actorsAbbr,
    setActorsAbbr,
    activeMembers,
    setActiveMembers,
    inactiveMembers,
    setInactiveMembers,
    actorsIsError,
  };
}
