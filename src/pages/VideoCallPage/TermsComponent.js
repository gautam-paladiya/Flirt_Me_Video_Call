import {
  Box,
  makeStyles,
  Paper,
  Popper,
  Switch,
  Card,
  Typography,
} from "@material-ui/core";
import React, { useRef } from "react";

const useStyle = makeStyles({
  parent: {
    display: "flex",
    padding: 3,
    margin: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

function TermsComponent(props) {
  const { terms, onChangeTerms, showTermsPopper } = props;
  const refTerms = useRef();
  const classes = useStyle();

  return (
    <Card elevation={3} className={classes.parent}>
      <Switch
        aria-describedby="terms"
        checked={terms}
        value={terms}
        onChange={(e) => onChangeTerms(e)}
        color="primary"
        name="checkedA"
        inputProps={{ "aria-label": "primary checkbox" }}
        ref={refTerms}
      />
      <Popper id="terms" open={showTermsPopper} anchorEl={refTerms.current}>
        <Paper>You must agree to continue</Paper>
      </Popper>
      <p className="text-lg font-bold">
        I certify I have read and agree to the <u>Terms of Use</u> and
        Guidelines.
      </p>
    </Card>
  );
}

export default TermsComponent;
