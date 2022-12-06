import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useState } from "react";
import { Alert, Button, Card, Form, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";
import { usePageContext } from "./RolesPage";

export default function Role() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "all" });
  const onError = (errors: any) => {};
  const { setErrorMsg, setStatusMsg, roles, setRoles } = usePageContext();

  const [groups, setGroups]: [string[], any] = useState([]);
  const [addGranted, setAddGranted]: [string[], any] = useState([]);

  // update the role
  const handleAdd = (data: any) => {
    console.log("Adding...");
    let req = new proto.roles.AddRoleRequest()
      .setGrantedToList(addGranted)
      .setDesc(data.desc)
      .setName(data.name);

    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );

    gatehouseSvc
      .addRole(req, null)
      .then((response: proto.roles.RoleResponse) => {
        let added_role = response.getRole();

        if (!added_role) {
          setErrorMsg("No update role returned from server");
          return;
        }

        console.log("Added!");
        setStatusMsg("Role " + added_role.getName() + " added!");

        setRoles(roles.set(added_role.getName(), added_role));

        navigate("/roles/view/" + added_role.getName());
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
      });
  };

  /// load the group names
  useEffect(() => {
    let request = new proto.groups.GetGroupsRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );

    gatehouseSvc
      .getGroups(request, null)
      .then((response: proto.groups.MultiGroupResponse) => {
        console.log("Loading groups...");
        let grp_names: string[] = [];
        response.getGroupsList().forEach((group: proto.groups.Group) => {
          grp_names.push(group.getName());
        });
        setGroups(grp_names);
        console.log("Loaded " + grp_names.length + " groups");
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
      });
  }, []);

  // called when the selectors are changed for the adding of new granted groups
  const handleAddGrantedChange = (event: ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();

    // user has chosen to add a new grant
    if (event.target.id === "add_new" && event.target.value !== "--remove--") {
      console.log("Add " + event.target.value + " to list of granted groups");
      let new_grant = event.target.value;
      event.target.value = "--remove--";
      setAddGranted([...addGranted, new_grant]);
    }
  };

  // toggle to remove an added grant
  const handleRemoveAddedGrant = (grant_name: string) => {
    console.log("remove: " + grant_name);
    let new_list = [...addGranted].filter((item) => item !== grant_name);
    setAddGranted(new_list);
  };

  let new_grants = () => {
    let elements: JSX.Element[] = [];
    let group_options: JSX.Element[] = [];
    group_options.push(
      <option key="option_remove" value="--remove--">
        ---
      </option>
    );
    groups.sort().forEach((name) => {
      if (!addGranted.includes(name)) {
        group_options.push(
          <option key={"option_" + name} value={name}>
            {name}
          </option>
        );
      }
    });

    [...addGranted].sort().forEach((granted_name, index) => {
      elements.push(
        <tr key={"add_" + index}>
          <td key={"add_" + index} className="small-button-entity">
            <FontAwesomeIcon
              icon={faSquareXmark}
              className="icon"
              inverse
              onClick={() => handleRemoveAddedGrant(granted_name)}
            />
            {granted_name}
          </td>
        </tr>
      );
    });

    elements.push(
      <tr key={"add_new"}>
        <td key={"add_new"}>
          <Form.Select
            key={"add_new"}
            id={"add_new"}
            onChange={handleAddGrantedChange}
          >
            {group_options}
          </Form.Select>
        </td>
      </tr>
    );

    return elements;
  };

  return (
    <Form onSubmit={handleSubmit(handleAdd, onError)}>
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>
            <Form.Control
              className="name"
              id="name"
              placeholder="Role name"
              {...register("name", {
                required: false,
                pattern: {
                  value: /^[a-z0-9-_@]+$/i,
                  message:
                    "Invalid characters (alphanum, dashes, underscores, and at-sign only)",
                },
              })}
            />
            {errors && errors.name && errors.name.message && (
              <p className="formError">{errors.name.message.toString()}</p>
            )}
          </Card.Title>
          <Card.Subtitle>
            <Form.Control
              className="desc"
              id="desc"
              placeholder="Optional description"
              {...register("desc", {
                required: false,
              })}
            />
          </Card.Subtitle>
          <Table className="showEntryTable">
            <thead>
              <tr>
                <th>Grant to</th>
              </tr>
            </thead>
            <tbody>{new_grants()}</tbody>
          </Table>
          <Card.Footer>
            <Button type="submit">Save</Button>
          </Card.Footer>
        </Card.Body>
      </Card>
    </Form>
  );
}
