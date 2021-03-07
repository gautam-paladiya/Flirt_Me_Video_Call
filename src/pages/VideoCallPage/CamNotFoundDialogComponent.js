import React from "react";
import { Modal, Button } from "react-bootstrap";

function CamNotFoundDialogComponent(props) {
  return (
    <Modal show={props.display} onHide={props.onClose}>
      <Modal.Header id="simple-dialog-title" closeButton>
        <Modal.Title>
          Sorry your device not supporting camera hardware{" "}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="alert-dialog-description">
        To countinue please allow requested permission
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => props.onClose()} color="primary">
          Disagree
        </Button>
        <Button
          onClick={async () => {
            await props.onAgree();
            return props.onClose();
          }}
          color="primary"
          autoFocus
        >
          Agree
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CamNotFoundDialogComponent;
