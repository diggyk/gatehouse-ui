import { useState } from "react";
import { Alert, Button, Card, Container, Modal, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";
import { usePageContext } from "./RolesPage";

export default function Role() {
  const navigate = useNavigate();
  const { name } = useParams();
  const { setErrorMsg, setStatusMsg, roles, setRoles } = usePageContext();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDelete = (name: string) => {
    let req = new proto.roles.RemoveRoleRequest().setName(name);

    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );

    gatehouseSvc
      .removeRole(req, null)
      .then((response: proto.roles.RoleResponse) => {
        setStatusMsg("Role " + name + " deleted!");
        roles.delete(name);
        setRoles(roles);
        navigate("/roles");
      })
      .catch((error: Error) => {
        setErrorMsg(error.message);
      });
  };

  if (!name) {
    return <Alert variant="danger">Error -- name not set</Alert>;
  }

  const role = roles.get(name);

  if (!role) {
    return <Alert variant="danger">ERROR: Role not found in context</Alert>;
  }

  let groups: JSX.Element[] = [];
  role
    .getGrantedToList()
    .sort()
    .forEach((group: string) => {
      groups.push(
        <tr key={"group_" + group}>
          <td>{group}</td>
        </tr>
      );
    });

  return (
    <>
      <Modal show={deleteConfirm} onHide={() => setDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Deleting cannot be undone. Are you sure you want to delete?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleDelete(name)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>{role.getName()}</Card.Title>
          <Card.Subtitle>{role.getDesc()}</Card.Subtitle>
          <Table className="showEntryTable">
            <thead>
              <tr>
                <th>Granted To</th>
              </tr>
            </thead>
            <tbody>{groups}</tbody>
          </Table>
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
