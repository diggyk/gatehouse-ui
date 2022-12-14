import {
  faChevronRight,
  faSquareCaretLeft,
  faSquareCaretRight,
  faSquarePlus,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import SetListEditor from "../elements/SetListEditor";
import useActors from "../hooks/useActors";
import useRoles from "../hooks/useRoles";
import useSetDiff from "../hooks/useSetDiff";
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

  const { rolesAbbr } = useRoles(client, { setErrorMsg });
  const [currentRoles, setCurrentRoles]: [string[], any] = useState([]);
  const [grants, setGrants]: [Set<string>, Function] = useState(new Set());
  const { added: rolesAdded, removed: rolesRemoved } = useSetDiff(
    currentRoles,
    grants
  );

  const {
    actorsAbbr,
    activeMembers,
    setActiveMembers,
    inactiveMembers,
    setInactiveMembers,
  } = useActors(client, { setErrorMsg, group: groups.get(name || "") });

  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    if (name && groups.get(name))
      setCurrentRoles(groups.get(name)!.getRolesList());
  }, [name, groups]);

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
      .setAddRolesList(rolesAdded)
      .setRemoveRolesList(rolesRemoved)
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
        navigate("/groups/view/" + updated_group.getName());
      })
      .catch((error: Error) => {
        setErrorMsg(error.message);
      });
  };

  // move a member to active list
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

  // move a member to the inactive list
  const moveToInactive = (typestr: string, name: string) => {
    activeMembers.get(typestr)?.delete(name);
    if (activeMembers.get(typestr)?.size === 0) {
      activeMembers.delete(typestr);
    }

    if (actorsAbbr.has(typestr + ":" + name)) {
      if (!inactiveMembers.has(typestr))
        inactiveMembers.set(typestr, new Set());
      inactiveMembers.get(typestr)?.add(name);
    }

    setActiveMembers(new Map(activeMembers));
    setInactiveMembers(new Map(inactiveMembers));
  };

  if (!name) {
    return <Container>Error -- name not set</Container>;
  }

  const group = groups.get(name)!;

  if (!group) {
    return <Alert variant="danger">ERROR: Group not found in context</Alert>;
  }

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
          let registered = actorsAbbr.has(typestr + ":" + name);
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
                <SetListEditor
                  list={grants}
                  setList={setGrants}
                  initialVals={group.getRolesList()}
                  sectionHeader="Roles granted"
                  optionsList={rolesAbbr}
                />
              </Col>
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
