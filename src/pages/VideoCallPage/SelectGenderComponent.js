import React from "react";
import { FaSkullCrossbones } from "react-icons/fa";
import MaleIcon from "../../assets/images/malel.png";
import FemaleIcon from "../../assets/images/femalel.png";
import GenOIcon from "../../assets/images/genderO.png";
import {
  Avatar,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  makeStyles,
  Typography,
  Divider,
} from "@material-ui/core";

const list = [
  {
    icon: MaleIcon,
    text: "MALE",
  },
  {
    icon: FemaleIcon,
    text: "FEMALE",
  },
  {
    icon: GenOIcon,
    text: "OTHER",
  },
];

const useStyles = makeStyles((theme) => ({
  root: { fontSize: 25 },
  small: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  name: {
    fontSize: 25,
    fontWeight: "bold",
  },
  listItem: {
    "&:hover": {
      opacity: 0.8,
      backgroundColor: "red",
      color: "white",
    },
    cursor: "pointer",
  },
}));

function SelectGenderComponent(props) {
  const { display, onClose, onSelectGender } = props;
  const classes = useStyles();

  return (
    <Dialog open={display} onClose={() => onClose()} className={classes.parent}>
      <p className="text-2xl font-bold p-5">Select your gender type</p>
      <Divider />
      <List>
        {list.map(({ icon, text }) => (
          <ListItem
            className={classes.listItem}
            button
            onClick={() => onSelectGender(text)}
          >
            <img src={icon} className="w-16 h-14 object-cover" />
            <h1 className="text-lg font-bold text-black ">{text}</h1>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

export default SelectGenderComponent;
