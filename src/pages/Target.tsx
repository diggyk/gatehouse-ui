import { useState } from "react";
import { Button, Card, Container, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import AttributeViewer from "../elements/AttributeViewer";
import ConfirmModal from "../elements/ConfirmModal";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import { usePageContext } from "./TargetsPage";

export default function Actor() {
  const navigate = useNavigate();
  const { client, setTargets, targets, setStatusMsg, setErrorMsg } =
    usePageContext();
  const { typestr, name } = useParams();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDelete = (typestr: string, name: string) => {
    let req = new proto.targets.RemoveTargetRequest()
      .setName(name)
      .setTypestr(typestr);

    client
      .removeTarget(req, null)
      .then((response: proto.actors.ActorResponse) => {
        setStatusMsg("Actor " + typestr + ":" + name + " deleted!");

        targets.get(typestr)?.delete(name);
        setTargets(new Map(targets));
        navigate("/targets");
      })
      .catch((error: Error) => {
        setErrorMsg(error.message);
      });
  };

  if (!typestr || !name) {
    return <Container>Error -- type or name not set</Container>;
  }

  const target = targets.get(typestr)?.get(name);

  if (!target) {
    return (
      <Card>
        <Card.Body>ERROR: Target not found in context</Card.Body>
      </Card>
    );
  }

  let actions: JSX.Element[] = [];
  let actions_list = target.getActionsList().sort();
  if (actions_list.length > 0) {
    actions_list.forEach((action) => {
      actions.push(<SectionItem key={action + "_item"}>{action}</SectionItem>);
    });
  } else {
    actions.push(<SectionItem key={"noactions"}>No actions</SectionItem>);
  }

  return (
    <>
      <ConfirmModal
        show={deleteConfirm}
        setShow={setDeleteConfirm}
        confirmCallback={() => handleDelete(typestr, name)}
      />
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>{target.getName()}</Card.Title>
          <Card.Subtitle>{target.getTypestr()}</Card.Subtitle>
          <SectionHeader>Attributes</SectionHeader>
          <SectionItem>
            <AttributeViewer attribs={target.getAttributesMap()} />
          </SectionItem>
          <SectionHeader>Actions</SectionHeader>
          {actions}
          <Card.Footer>
            <Link
              to={"../edit/" + target.getTypestr() + "/" + target.getName()}
            >
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
