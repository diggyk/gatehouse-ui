import { useState } from "react";
import { Alert, Button, Card, Container, Modal, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../elements/ConfirmModal";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";
import { usePageContext } from "./GroupsPage";

export default function Group() {
  const { setErrorMsg, setStatusMsg, groups, setGroups, client } =
    usePageContext();
  const navigate = useNavigate();
  const { name } = useParams();

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDelete = (name: string) => {
    let req = new proto.groups.RemoveGroupRequest().setName(name);

    client
      .removeGroup(req, null)
      .then((response: proto.groups.GroupResponse) => {
        setStatusMsg("Group " + name + " deleted!");
        groups.delete(name);
        setGroups(groups);
        navigate("/groups");
      })
      .catch((error: Error) => {
        setErrorMsg(error.message);
      });
  };

  if (!name) {
    return <Alert variant="danger">Error -- name not set</Alert>;
  }

  const group = groups.get(name);

  if (!group) {
    return <Alert variant="danger">ERROR: Group not found in context</Alert>;
  }

  let roles: JSX.Element[] = [];
  group
    .getRolesList()
    .sort()
    .forEach((role) => {
      roles.push(<SectionItem key={"role_" + role}>{role}</SectionItem>);
    });

  let members: JSX.Element[] = [];
  group
    .getMembersList()
    .sort((a, b) => {
      let type_cmp = a.getTypestr().localeCompare(b.getTypestr());
      if (type_cmp === 0) {
        return a.getName().localeCompare(b.getName());
      } else {
        return type_cmp;
      }
    })
    .forEach((member) => {
      members.push(
        <SectionItem key={member.getTypestr() + ":" + member.getName()}>
          {member.getTypestr()}:{member.getName()}
        </SectionItem>
      );
    });

  if (members.length == 0) {
    members.push(<SectionItem key={"nomembers"}>No members</SectionItem>);
  }

  return (
    <>
      <ConfirmModal
        show={deleteConfirm}
        setShow={setDeleteConfirm}
        confirmCallback={() => handleDelete(name)}
      />
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>{group.getName()}</Card.Title>
          <Card.Subtitle>{group.getDesc()}</Card.Subtitle>
          <SectionHeader>Roles</SectionHeader>
          {roles}
          <SectionHeader>Members</SectionHeader>
          {members}
          <Card.Footer>
            <Link to={"../edit/" + name}>
              <Button>Edit</Button>
            </Link>
            <Button
              style={{ float: "right" }}
              variant="secondary"
              onClick={(_) => setDeleteConfirm(true)}
            >
              Delete
            </Button>
          </Card.Footer>
        </Card.Body>
      </Card>
    </>
  );
}
