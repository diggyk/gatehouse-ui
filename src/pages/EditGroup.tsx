import {
  faChevronRight,
  faSquareCaretLeft,
  faSquareCaretRight,
  faSquarePlus,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type } from "os";
import { ChangeEvent, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Expando from "../elements/Expando";
import ExpandoItem from "../elements/ExpandoItem";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import { usePageContext } from "./GroupsPage";

export default function EditGroup() {
  /// This page won't be added to render until the page context exists

  const navigate = useNavigate();
  const { name } = useParams();
  const { client, setErrorMsg, setStatusMsg, groups, setGroups } =
    usePageContext();
  const { register, handleSubmit } = useForm({ mode: "all" });
  const {
    register: reg2,
    handleSubmit: hs2,
    formState: { errors: e2 },
  } = useForm({ mode: "all" });
  const onError = (errors: any) => {};

  const [registeredActors, setRegisteredActors]: [Set<string>, any] = useState(
    new Set()
  );

  const [roles, setRoles]: [string[], any] = useState([]);
  const [addRolesList, setAddRolesList]: [string[], any] = useState([]);
  const [removeRolesList, setRemoveRolesList]: [string[], any] = useState([]);

  const [activeMembers, setActiveMembers]: [Map<string, Set<string>>, any] =
    useState(new Map());
  const [inactiveMembers, setInactiveMembers]: [Map<string, Set<string>>, any] =
    useState(new Map());

  const [showAddMember, setShowAddMember] = useState(false);

  // check if a member is in a member map
  const inMap = (
    member: proto.groups.GroupMember,
    map: Map<string, Set<string>>
  ): boolean => {
    let typestr = member.getTypestr();
    let name = member.getName();

    if (map.get(typestr)?.has(name)) {
      return true;
    } else {
      return false;
    }
  };

  // check if a type/name combo is a current member
  const inMembers = (
    typestr: string,
    name: string,
    members: proto.groups.GroupMember[]
  ): boolean => {
    members.forEach((member) => {
      if (member.getTypestr() === typestr && member.getName() === name)
        return true;
    });
    return false;
  };

  // update the group
  const handleUpdate = (data: any) => {
    // check the current members and see if they are in the active members to see who needs to be removed
    let membersToRemove: proto.groups.GroupMember[] = [];
    group.getMembersList().forEach((current_member) => {
      if (!inMap(current_member, activeMembers)) {
        membersToRemove.push(current_member);
      }
    });

    // check the active members and see if they are in current members to see who needs to be added
    let membersToAdd: proto.groups.GroupMember[] = [];
    activeMembers.forEach((names, typestr) => {
      names.forEach((name) => {
        if (!inMembers(typestr, name, group.getMembersList()))
          membersToAdd.push(
            new proto.groups.GroupMember().setName(name).setTypestr(typestr)
          );
      });
    });

    let req = new proto.groups.ModifyGroupRequest()
      .setName(name || "")
      .setDesc(data.desc)
      .setAddRolesList(addRolesList)
      .setRemoveRolesList(removeRolesList)
      .setAddMembersList(membersToAdd)
      .setRemoveMembersList(membersToRemove);

    client
      .modifyGroup(req, null)
      .then((response: proto.groups.GroupResponse) => {
        let updated_group = response.getGroup();

        if (!updated_group) {
          setErrorMsg("No updated group returned from server");
          return;
        }

        setStatusMsg("Group " + updated_group.getName() + " updated!");
        setGroups(groups.set(updated_group.getName(), updated_group));
        setAddRolesList([]);
        setAddRolesList([]);
        navigate("/groups/view/" + updated_group.getName());
      })
      .catch((error: Error) => {
        setErrorMsg(error.message);
      });
  };

  const moveToActive = (typestr: string, name: string) => {
    inactiveMembers.get(typestr)?.delete(name);
    if (inactiveMembers.get(typestr)?.size === 0) {
      inactiveMembers.delete(typestr);
    }

    if (!activeMembers.has(typestr)) activeMembers.set(typestr, new Set());
    activeMembers.get(typestr)?.add(name);

    setActiveMembers(new Map(activeMembers));
    setInactiveMembers(new Map(inactiveMembers));
  };

  const moveToInactive = (typestr: string, name: string) => {
    activeMembers.get(typestr)?.delete(name);
    if (activeMembers.get(typestr)?.size === 0) {
      activeMembers.delete(typestr);
    }

    if (registeredActors.has(typestr + ":" + name)) {
      if (!inactiveMembers.has(typestr))
        inactiveMembers.set(typestr, new Set());
      inactiveMembers.get(typestr)?.add(name);
    }

    setActiveMembers(new Map(activeMembers));
    setInactiveMembers(new Map(inactiveMembers));
  };

  /// load the role names and known actors
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
        setErrorMsg(err.message);
      });

    // Sort the existing actors
    let active_map = new Map<string, Set<string>>();

    group.getMembersList().forEach((member) => {
      let typestr = member.getTypestr();
      let name = member.getName();

      if (!active_map.has(typestr)) {
        active_map.set(typestr, new Set());
      }
      active_map.get(typestr)?.add(name);
    });
    setActiveMembers(active_map);

    // Get all existing known actors
    client
      .getActors(request, null)
      .then((response) => {
        let known_actors_set = new Set<string>();
        let inactive_map = new Map<string, Set<string>>();
        let actors = response.getActorsList();

        console.log("Loaded " + actors.length + " actors");

        actors.forEach((entity: proto.actors.Actor) => {
          let typestr = entity.getTypestr();
          let name = entity.getName();

          known_actors_set.add(typestr + ":" + name);

          if (!active_map.get(typestr)?.has(name)) {
            console.log("No " + typestr + ":" + name);
            if (!inactive_map.has(typestr)) {
              inactive_map.set(typestr, new Set());
            }
            inactive_map.get(typestr)?.add(name);
          }
        });
        setRegisteredActors(known_actors_set);
        setInactiveMembers(new Map(inactive_map));
      })
      .catch((err) => {
        setErrorMsg(err.message);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!name) {
    return <Container>Error -- name not set</Container>;
  }

  const group = groups.get(name)!;

  if (!group) {
    return <Alert variant="danger">ERROR: Group not found in context</Alert>;
  }

  // called when the selectors are changed for the adding of new roles
  const addRole = (event: ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();

    // user has chosen to add a new grant
    if (event.target.id === "add_new" && event.target.value !== "--remove--") {
      console.log("Add " + event.target.value + " to list of granted roles");
      let new_grant = event.target.value;
      event.target.value = "--remove--";
      setAddRolesList([...addRolesList, new_grant]);
    }
  };

  // remove an added role
  const removeAddedRole = (role_name: string) => {
    console.log("remove: " + role_name);
    let new_list = [...addRolesList].filter((item) => item !== role_name);
    setAddRolesList(new_list);
  };

  // toggle and existing role
  const toggleExistingRole = (role_name: string) => {
    if (removeRolesList.includes(role_name)) {
      setRemoveRolesList(
        [...removeRolesList].filter((item) => item !== role_name)
      );
    } else {
      setRemoveRolesList([...removeRolesList, role_name]);
    }
  };

  const existing_roles = () => {
    /// All our elements for managing group removals
    let elements: JSX.Element[] = [];
    group
      .getRolesList()
      .sort()
      .forEach((role_name: string, index) => {
        elements.push(
          <SectionItem key={role_name + "_del"}>
            <Form.Switch
              type="switch"
              id={role_name + "_del"}
              key={role_name + "_del"}
            >
              <Form.Switch.Input
                className="remove-switch"
                checked={removeRolesList.includes(role_name)}
                onChange={() => toggleExistingRole(role_name)}
              ></Form.Switch.Input>
              <Form.Switch.Label className="remove-switch-label">
                {role_name}
              </Form.Switch.Label>
            </Form.Switch>
          </SectionItem>
        );
      });

    return elements;
  };

  let new_roles_section = () => {
    let elements: JSX.Element[] = [];
    let role_options: JSX.Element[] = [];
    role_options.push(
      <option key="option_remove" value="--remove--">
        ---
      </option>
    );
    roles.sort().forEach((name) => {
      if (
        !group.getRolesList().includes(name) &&
        !addRolesList.includes(name)
      ) {
        role_options.push(
          <option key={"option_" + name} value={name}>
            {name}
          </option>
        );
      }
    });

    [...addRolesList].sort().forEach((granted_name, index) => {
      elements.push(
        <SectionItem key={"add_" + index}>
          <FontAwesomeIcon
            icon={faSquareXmark}
            className="delete-icon-btn"
            inverse
            onClick={() => removeAddedRole(granted_name)}
          />
          {granted_name}
        </SectionItem>
      );
    });

    elements.push(
      <SectionItem key={"add_new"}>
        <Form.Select key={"add_new"} id={"add_new"} onChange={addRole}>
          {role_options}
        </Form.Select>
      </SectionItem>
    );

    return elements;
  };

  let members_sections = () => {
    let elements: JSX.Element[] = [];
    [...activeMembers.keys()]
      .sort((a, b) => {
        return a.localeCompare(b);
      })
      .forEach((typestr) => {
        let items: JSX.Element[] = [];
        [...activeMembers.get(typestr)!.values()].sort().forEach((name) => {
          // if the actor isn't a registered actor, we need to denote that
          let registered = registeredActors.has(typestr + ":" + name);
          let display_name = !registered ? name + " *" : name;

          items.push(
            <ExpandoItem
              onClick={() => {
                moveToInactive(typestr, name);
              }}
              key={typestr + ":" + name}
            >
              {display_name}
              <FontAwesomeIcon
                icon={registered ? faSquareCaretRight : faSquareXmark}
                className="red-right-btn"
              />
            </ExpandoItem>
          );
        });
        elements.push(
          <Expando key={"members_" + typestr} title={typestr}>
            {items}
          </Expando>
        );
      });

    return <>{elements}</>;
  };

  let possible_members_sections = () => {
    let elements: JSX.Element[] = [];
    [...inactiveMembers.keys()]
      .sort((a, b) => {
        return a.localeCompare(b);
      })
      .forEach((typestr) => {
        let items: JSX.Element[] = [];
        [...inactiveMembers.get(typestr)!.values()].sort().forEach((name) => {
          items.push(
            <ExpandoItem
              onClick={() => moveToActive(typestr, name)}
              leftButton
              key={typestr + ":" + name}
            >
              {name}
              <FontAwesomeIcon
                icon={faSquareCaretLeft}
                className="green-left-btn"
              />
            </ExpandoItem>
          );
        });
        elements.push(
          <Expando key={"possibles_" + typestr} title={typestr}>
            {items}
          </Expando>
        );
      });

    return <>{elements}</>;
  };

  const addAdhocMember = (data: any) => {
    let typestr = data.typestr;
    let name = data.name;

    if (!typestr || !name) {
      setErrorMsg("Cannot add adhoc member with incorrect name or type");
    }

    if (!activeMembers.has(typestr)) activeMembers.set(typestr, new Set());
    activeMembers.get(typestr)!.add(name);

    setStatusMsg("Added " + typestr + ":" + name + " adhoc member");
    setShowAddMember(false);
  };

  return (
    <>
      <Modal show={showAddMember} onHide={() => setShowAddMember(false)}>
        <Form onSubmit={hs2(addAdhocMember)}>
          <Modal.Header closeButton>
            <Modal.Title>Add an adhoc member</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              id="typestr"
              placeholder="Type"
              {...reg2("typestr", {
                required: true,
                pattern: {
                  value: /^[a-z0-9-_@]+$/i,
                  message:
                    "Invalid characters (alphanum, dashes, underscores, and at-sign only)",
                },
              })}
            ></Form.Control>
            {e2 && e2.typestr && e2.typestr.message && (
              <p className="formError">{e2.typestr.message.toString()}</p>
            )}
            <Form.Control
              id="name"
              placeholder="Name"
              style={{ marginTop: "10px" }}
              {...reg2("name", {
                required: true,
                pattern: {
                  value: /^[a-z0-9-_@]+$/i,
                  message:
                    "Invalid characters (alphanum, dashes, underscores, and at-sign only)",
                },
              })}
            ></Form.Control>
            {e2 && e2.name && e2.name.message && (
              <p className="formError">{e2.name.message.toString()}</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Form onSubmit={handleSubmit(handleUpdate, onError)}>
        <Card className="showEntryCard wide">
          <Card.Body>
            <Card.Title>{group.getName()}</Card.Title>
            <Card.Subtitle>
              <Form.Control
                className="desc"
                id="desc"
                defaultValue={group.getDesc()}
                placeholder="Optional description"
                {...register("desc", {
                  required: false,
                })}
              />
            </Card.Subtitle>
            <Row lg="auto">
              <Col>
                <SectionHeader>Granted roles</SectionHeader>
                {existing_roles()}
                <SectionHeader>Grant roles</SectionHeader>
                {new_roles_section()}
              </Col>
              <Col>
                <Row>
                  <Col>
                    <SectionHeader
                      rightIcon={
                        <FontAwesomeIcon
                          icon={faSquarePlus}
                          className="plusButton"
                          inverse
                          onClick={() => setShowAddMember(true)}
                        />
                      }
                    >
                      Members
                    </SectionHeader>
                    {members_sections()}
                  </Col>
                  <Col>
                    <SectionHeader>Available actors</SectionHeader>
                    {possible_members_sections()}
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col className="footnote">
                * denotes adhoc group members not found in list of registered
                actors
              </Col>
            </Row>
            <Card.Footer>
              <Button type="submit">Save</Button>
            </Card.Footer>
          </Card.Body>
        </Card>
      </Form>
    </>
  );
}
