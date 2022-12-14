import { PropsWithChildren } from "react";
import { Button, Modal } from "react-bootstrap";

interface Props {
  show: boolean;
  setShow: Function;
  header?: string;
  message?: string;
  cancelBtnText?: string;
  confirmBtnText?: string;
  confirmCallback: Function;
}

export default function ConfirmModal(props: PropsWithChildren<Props>) {
  return (
    <Modal show={props.show} onHide={() => props.setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>
          {props.header ? props.header : "Confirm delete"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.message
          ? props.message
          : "Deleting cannot be undone. Are you sure you want to delete?"}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => props.setShow(false)}>
          {props.cancelBtnText ? props.cancelBtnText : "Cancel"}
        </Button>
        <Button variant="primary" onClick={() => props.confirmCallback()}>
          {props.confirmBtnText ? props.confirmBtnText : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
