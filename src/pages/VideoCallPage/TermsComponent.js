import React, { useRef } from "react";
import { Card, Form, Overlay, Popover } from "react-bootstrap";
import LogHelper from "../../utils/LogHelper";

function TermsComponent(props) {
  const { terms, onChangeTerms, showTermsPopper } = props;
  const refTerms = useRef();

  return (
    <Card elevation={3} className="flex flex-row items-center p-2">
      <Form.Check
        id="switchEnabled"
        type="switch"
        checked={terms}
        onChange={(e) => onChangeTerms(e)}
        color="primary"
        name="checkedA"
        ref={refTerms}
      />
      <Overlay target={refTerms} show={showTermsPopper} placement="top">
        <Popover id="terms">
          <Popover.Content>
            <strong>You must agree to continue</strong>
          </Popover.Content>
        </Popover>
      </Overlay>
      <p className="text-lg font-bold font-serif">
        I certify I have read and agree to the <u>Terms of Use</u> and
        Guidelines.
      </p>
    </Card>
  );
}

export default TermsComponent;
