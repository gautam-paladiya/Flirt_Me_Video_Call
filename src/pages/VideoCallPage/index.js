import React, { Component } from "react";
import { countries } from "countries-list";

import io from "socket.io-client";
import Peer from "peerjs";
import { FaPlay, FaGlobe, FaCaretDown } from "react-icons/fa";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  DialogActions,
  Popper,
  makeStyles,
  Paper,
  withStyles,
  Box,
} from "@material-ui/core";
import { BsGearFill } from "react-icons/bs";
import {
  FaArrowRight,
  FaRegStopCircle,
  FaArrowAltCircleRight,
} from "react-icons/fa";
import axios from "axios";
import {
  CompleteConnected,
  GoOffline,
  GoOnline,
  StartConnecting,
  StartWaiting,
  StopConnecting,
  StartExit,
  CONNECTED,
  NOTCONNECTED,
  Disconnect,
  DISCONNECT,
  NotConnected,
} from "../../store/CallingAction";
import { connect } from "react-redux";
import SelectGenderComponent from "./SelectGenderComponent";
import TermsComponent from "./TermsComponent";
import LoginRegisterComponent from "../../Components/LoginRegisterComponent";
import MaleIcon from "../../assets/images/malel.png";
import FemaleIcon from "../../assets/images/femalel.png";
import GenOIcon from "../../assets/images/genderO.png";
import SelectCountryComponent from "./SelectCountryComponent";
import SelectCGenderComponent from "./SelectCGenderComponent";
import ProfileDialogComponent from "./ProfileDialogComponent";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import ComponentCheckoutForm from "../../Components/ComponentCheckoutForm";
import GoogleIcon from "../../assets/images/google.png";
import { FaFacebook, FaEnvelope } from "react-icons/fa";
import { Alert } from "react-bootstrap";
import AxiosInstance from "../../utils/AxiosInstance";

const stripePromise = loadStripe("pk_test_6pRNASCoBOKtIshFeQd4XMUh");

export class VideoCallPage extends Component {
  constructor() {
    super();
    this.state = {
      gender: localStorage.getItem("gender"),
      terms: localStorage.getItem("terms") == "true" ? true : false,
      genderModal: false,
      profileModal: false,
      country: localStorage.getItem("country"),
      anchorEl: null,
      camNotFound: false,
      showCameraDialog: false,
      showGenderDialog: false,
      showProfileDialog: false,
      showCGenderDialog: false,
      showTermsPopper: false,
      showGenderPopper: false,
      showLoginRegister: false,
      showCountrySelect: false,
      showAlerDisconnect: false,
      cGender: localStorage.getItem("cGender") || "OTHER",
      cCountry: localStorage.getItem("cCountry") || "GLOBAL",
      client: {},
    };
    this.termRef = React.createRef();
  }

  getStream = () => {
    try {
      const stream = navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: this.props.calling.connectStatus == CONNECTED ? true : false,
        })
        .then((stream) => {
          return stream;
        })
        .catch((err) => {
          console.log(`erro ${err}`);
          return;
        });
      return stream;
    } catch (error) {
      console.log(`error ${error}`);
      return;
    }
  };

  initVideo = async () => {
    var stream = await this.getStream();
    console.log(`${stream}`);
    if (stream) {
      this.remoteVideo.srcObject = stream;
      console.log("cam found");
      await this.setState({ ...this.state, camNotFound: false });
    } else {
      console.log("cam not found");
      await this.setState({
        ...this.state,
        camNotFound: true,
        showCameraDialog: true,
      });
    }
  };

  componentWillMount() {
    if (typeof this.state.country == "undefined" || !this.state.country) {
      AxiosInstance.get("getCountry").then((res) => {
        console.log(`country ${JSON.stringify(res)}`);
        if (res.data.geoplugin_status == 200) {
          this.setState(
            { ...this.state, country: res.data.geoplugin_countryCode },
            () => {
              localStorage.setItem("country", res.data.geoplugin_countryCode);
            }
          );
        }
      });
    }
  }

  setGender = () => {
    if (this.state.gender) {
      this.socket.emit("setGender", {
        gender: this.state.gender,
      });
    }
  };

  setCountry = () => {
    if (this.state.country) {
      this.socket.emit("setCountry", { country: this.state.country });
    }
  };

  showAlert = () => {
    this.setState({ ...this.state, showAlerDisconnect: true });

    setTimeout(() => {
      this.setState({ ...this.state, showAlerDisconnect: false });
    }, 5000);
  };

  componentDidMount() {
    this.remoteVideo = document.getElementById("remote-video");
    this.localVideo = document.getElementById("local-video");
    this.initVideo();

    console.log(`${process.env.REACT_APP_SOCKET_CONNECTION_STRING}`);
    this.socket = io(`${process.env.REACT_APP_SOCKET_CONNECTION_STRING}`);

    this.peer = new Peer({
      config: {
        iceServers: [
          { url: "stun:stun.l.google.com:19302" },
          { url: "stun:stunserver.org" },
        ],
      },
    });

    this.socket.on("connect", () => {
      console.log(`socket connect id ${this.socket.id} ${this.state.country} `);
    });

    this.socket.on("yourID", () => {
      this.setCountry();
      this.setGender();
    });

    this.socket.on("requestCall", async (arg, callback) => {
      this.props.dispatch(StartConnecting());
      this.dataConnection = await this.peer.connect(arg.peerId);

      this.dataConnection.on("open", async () => {
        this.props.dispatch(CompleteConnected());

        this.socket.emit("userConnected", {
          connectedTo: arg.socketId,
        });

        this.mediaConnection = await this.peer.call(
          this.dataConnection.peer,
          await this.getStream()
        );
        this.mediaConnection.on("stream", async (remoteStream) => {
          // Show stream in some <video> element.
          this.remoteVideo.srcObject = remoteStream;
          this.localVideo.srcObject = await this.getStream();
        });
        this.mediaConnection.on("close", () => {
          console.log("media close");
        });
      });

      // Receive messages
      this.dataConnection.on("data", (data) => {
        console.log("Received", data);
      });
      this.dataConnection.on("close", async () => {
        console.log("conn close");
        this.DisconnectRemote();
        this.showAlert();
        // await setisActive(true);
        // this.DisconnectCall();
      });
    });

    this.socket.on("afterConnect", (client) => {
      console.log(`after connect ${client}`);
      this.setState({
        ...this.state,
        client: client,
        showAlerDisconnect: false,
      });
    });

    this.peer.on("open", (id) => {
      console.log("My peer ID is: " + id);
    });

    this.peer.on("connection", (conn) => {
      console.log(`peer connected ${JSON.stringify(conn.open)}`);
      this.props.dispatch(CompleteConnected());
      // this.socket.emit("userConnected", {
      //   connectedTo: this.socket.id,
      // });

      conn.on("data", (data) => {
        // Will print 'hi!'
        console.log(data);
      });
      conn.on("open", () => {
        console.log("peer open");
        // conn.send({ peerId: this.peer.id });
      });
      conn.on("close", async () => {
        console.log("conns close");
        // await setisActive(true);
        // this.DisconnectCall();
        this.DisconnectRemote();
        this.showAlert();
      });
      this.dataConnection = conn;
    });

    this.peer.on("call", async (call) => {
      call.answer(await this.getStream()); // Answer the call with an A/V stream.
      call.on("stream", async (remoteStream) => {
        // Show stream in some <video> element.
        this.remoteVideo.srcObject = remoteStream;
        this.localVideo.srcObject = await this.getStream();

        // remoteVideo.load();
        // remoteVideo.play();
      });
      call.on("close", () => {
        console.log("medias close");
        // disconnect();
      });
      this.mediaConnection = call;
    });

    this.peer.on("error", (errr) => {
      console.log(`peer erro ${JSON.stringify(errr)}`);
    });

    this.peer.on("close", () => {
      console.log("peer close");
      // disconnect();
      // this.peer.disconnect();
    });

    this.peer.on("error", (err) => {
      console.log(`peer erro ${err.type}`);
    });

    this.peer.on("disconnected", () => {
      console.log("peer disconnected");

      this.socket.emit(
        "disconnected",
        { isAvailable: this.props.calling.isActive },
        async (res) => {
          this.props.dispatch(NotConnected());
          this.props.dispatch(StopConnecting());
          console.log("database disconnected ", this.props.calling.isActive);
          if (this.props.calling.isActive) {
            this.startConnecting();
          }
        }
      );
    });
    window.addEventListener("load", function () {
      window.scrollTo(0, 1);
    });
  }
  componentDidUpdate(prevProps, preState) {
    // console.log(`update ${this.peer.disconnected}`);
    // console.log(`update ${JSON.stringify(prevProps)}`);
    // console.log(`update ${JSON.stringify(preState)}`);
  }

  startConnecting = () => {
    if (this.state.camNotFound) {
      this.setState({ ...this.state, showCameraDialog: true });
      return;
    }
    if (!this.state.terms) {
      this.setState({ ...this.state, showTermsPopper: true });
      return;
    }
    if (!this.state.gender || typeof this.state.gender == "undefined") {
      this.setState({ ...this.state, showGenderDialog: true });
      return;
    }

    // this.handleLoginRegisterDialog();

    console.log("start connecting ", this.peer.id);
    this.props.dispatch(GoOnline());
    this.socket.emit(
      "start",
      {
        peerId: this.peer.id,
      },
      (response) => {
        console.log(response.message);

        if (response.userFound) {
          this.props.dispatch(StartConnecting());
        } else {
          this.props.dispatch(StartWaiting());
        }
      }
    );
  };

  DisconnectRemote = () => {
    this.initVideo();
    this.socket.emit(
      "disconnected",
      { isAvailable: this.props.calling.isActive },
      (res) => {
        this.props.dispatch(NotConnected());
        this.props.dispatch(StopConnecting());
        console.log("database dis connected ", this.props.calling.isActive);
      }
    );
  };

  DisconnectCall = () => {
    if (this.props.calling.connected) {
      console.log("con found");
      this.dataConnection.close();
      this.mediaConnection.close();
      //   this.peer.disconnect();
      // peer.current.destroy();
      this.initVideo();
    }
    this.socket.emit(
      "disconnected",
      { isAvailable: this.props.calling.isActive },
      (res) => {
        this.props.dispatch(NotConnected());
        this.props.dispatch(StopConnecting());
        console.log("database dis connected ", this.props.calling.isActive);
      }
    );
  };

  toggleGender = () => {
    this.setState({
      ...this.state,
      showGenderDialog: !this.state.showGenderDialog,
    });
  };

  handleSelectGender = (val) => {
    this.setState(
      {
        ...this.state,
        gender: val,
        showGenderDialog: !this.state.showGenderDialog,
      },
      () => {
        localStorage.setItem("gender", val);
        this.setGender();
      }
    );
  };

  handleChangeTerms = (e) => {
    this.setState(
      {
        ...this.state,
        terms: e.target.checked,
        showTermsPopper: !e.target.checked,
      },
      (newState) => {
        localStorage.setItem("terms", this.state.terms);
      }
    );
  };

  handleLoginRegisterDialog = () => {
    this.setState({
      ...this.state,
      showLoginRegister: !this.state.showLoginRegister,
    });
  };

  setCountrySelect = (country) => {
    var name = country;
    if (!name) {
      name = "GLOBAL";
    }
    console.log(country);
    localStorage.setItem("cCountry", name);
    this.setState({
      ...this.state,
      showCountrySelect: !this.state.showCountrySelect,
      cCountry: name,
    });
  };

  handleCountrySelectDialog = (country) => {
    localStorage.setItem("cCountry", "GLOBAL");
    this.setState({
      ...this.state,
      showCountrySelect: !this.state.showCountrySelect,
      cCountry: "GLOBAL",
    });
  };

  handleCSelectGenderDialog = () => {
    this.setState({
      ...this.state,
      showCGenderDialog: !this.state.showCGenderDialog,
    });
  };

  handleOnSelectCGender = (val) => {
    var name = val;
    if (!name) {
      name = "EVERY";
    }
    console.log(name);
    localStorage.setItem("cGender", name);
    this.setState({
      ...this.state,
      showCGenderDialog: !this.state.showCGenderDialog,
      cGender: name,
    });
  };

  handleToggleProfileDialog = () => {
    this.setState({
      ...this.state,
      showProfileDialog: !this.state.showProfileDialog,
    });
  };

  render() {
    console.log(`props ${JSON.stringify(this.state)}`);
    const { country } = this.state.client;
    console.log(`cou ${countries.country}`);
    return (
      <div className="w-screen h-screen flex flex-col bg-black overflow-hidden  ">
        <CamNotFoundDialog
          display={this.state.showCameraDialog}
          onClose={() =>
            this.setState({ ...this.state, showCameraDialog: false })
          }
          onAgree={() => this.initVideo()}
        />
        <SelectGenderComponent
          display={this.state.showGenderDialog}
          onClose={this.toggleGender}
          onSelectGender={(val) => this.handleSelectGender(val)}
        />
        <LoginRegisterComponent
          display={this.state.showLoginRegister}
          onClose={this.handleLoginRegisterDialog}
        />
        <SelectCountryComponent
          display={this.state.showCountrySelect}
          onClose={this.handleCountrySelectDialog}
          setCountrySelect={this.setCountrySelect}
        />
        <SelectCGenderComponent
          display={this.state.showCGenderDialog}
          onClose={this.handleCSelectGenderDialog}
          selectCGender={this.handleOnSelectCGender}
        />

        <ProfileDialogComponent
          display={this.state.showProfileDialog}
          onClose={this.handleToggleProfileDialog}
        />

        <div className="flex w-full h-full relative flex-1 overflow-hidden">
          <video
            autoPlay
            id="remote-video"
            className="w-full h-full videoback object-cover"
            width="100"
            height="100"
          />

          {!this.props.calling.isActive && (
            <div className="opacity-80  flex flex-col items-center justify-center space-y-9 absolute top-0 left-0 h-full w-full">
              <img src="/flirtLogo.png" className="w-96 h-80 " />
              {/* <h1 className="text-5xl lg:font-6xl font-bold text-red-500 ">
                Flirt Me Baby
              </h1> */}
              <h2 className="text-red-500 font-extrabold text-2xl">
                856,546 joined Flirt Me Baby
              </h2>
              <div className="flex flex-row w-full justify-center space-x-3 my-10 ">
                <div
                  className=" py-2 cursor-pointer rounded-lg shadow-md bg-gray-100 text-black text-lg font-bold px-5 flex items-center justify-center"
                  onClick={() => this.toggleGender()}
                >
                  I AM : {this.state.gender}
                </div>
                <div
                  onClick={() => {
                    this.socket.emit("online");
                    this.startConnecting();
                  }}
                  className=" py-2 cursor-pointer rounded-lg shadow-md bg-gray-100 text-black text-lg font-bold px-5 flex items-center justify-center"
                >
                  {<FaPlay size={22} className="text-black mr-3" />} Start
                </div>
              </div>
              <TermsComponent
                terms={this.state.terms}
                onChangeTerms={(e) => this.handleChangeTerms(e)}
                showTermsPopper={this.state.showTermsPopper}
              />
              <div className="flex items-center justify-center space-x-3 w-full ">
                <img
                  src={GoogleIcon}
                  className="w-16 h-16 rounded-full bg-white p-2 cursor-pointer"
                />
                <FaFacebook
                  size={64}
                  className="p-2 bg-blue-700 rounded-full text-white cursor-pointer"
                />
                <FaEnvelope
                  size={64}
                  className="p-2 bg-white rounded-full cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* <div className="hidden absolute w-full lg:flex bg-dark-gray  items-center bg-gray-900 p-5 justify-around">
            <img src={AndroidIcon} className="w-48 h-20" />
            <img src={IosIcon} className="w-48 h-20" />
          </div> */}

          <div className="absolute bg-transparent w-1/3 h-1/3 bottom-0 right-0">
            <video
              autoPlay
              id="local-video"
              className="w-full h-full min-h-full  bg-transparent object-cover "
              style={{
                visibility:
                  this.props.calling.connectStatus == CONNECTED
                    ? "visible"
                    : "hidden",
              }}
            />
          </div>

          {this.props.calling.isActive && (
            <div className="">
              <div className="flex flex-col absolute top-0 left-0 right-0 justify-between items-center">
                <div className="flex space-x-2 p-2">
                  <div
                    className=" p-2 cursor-pointer rounded-lg shadow-md bg-gray-100 text-black text-base lg:text-lg font-bold  flex items-center justify-center"
                    onClick={() => this.handleCSelectGenderDialog()}
                  >
                    FLIRT WITH
                    {this.state.cGender === "MALE" && (
                      <img src={MaleIcon} className="w-8 h-8 ml-2" />
                    )}
                    {this.state.cGender === "FEMALE" && (
                      <img src={FemaleIcon} className="w-8 h-8 ml-2" />
                    )}
                    {this.state.cGender === "OTHER" && (
                      <img src={GenOIcon} className="w-8 h-8 ml-2" />
                    )}
                    <FaCaretDown size={25} className="ml-2" />
                  </div>
                  <div
                    className=" p-2 cursor-pointer rounded-lg shadow-md bg-gray-100 text-black text-base lg:text-lg font-bold flex items-center justify-center"
                    onClick={() => this.handleCountrySelectDialog()}
                  >
                    LOCATION{" "}
                    {this.state.cCountry == "GLOBAL" ? (
                      <FaGlobe size={30} className="ml-2" />
                    ) : (
                      <div className={`flag:${this.state.cCountry} ml-2`} />
                    )}
                    <FaCaretDown size={25} className="ml-2" />
                  </div>
                </div>
                <div className="flex  items-center justify-between w-full p-2 lg:absolute lg:top-0 lg:right-0 lg:left-0">
                  {localStorage.getItem("name") && (
                    <div
                      className=" flex sm:flex-col justify-between items-center cursor-pointer "
                      onClick={() => this.handleToggleProfileDialog()}
                    >
                      <img
                        className="w-10 h-10 rounded-lg "
                        src={localStorage.getItem("picture")}
                      />
                      <h1 className="text-base font-bold text-white hidden lg:block">
                        {localStorage.getItem("name")}
                      </h1>
                    </div>
                  )}
                  {Object.keys(this.state.client).length > 0 && (
                    <div
                      className="flex flex-col justify-between items-center cursor-pointer "
                      onClick={() => this.handleToggleProfileDialog()}
                    >
                      {this.state.client.gender.toUpperCase() === "MALE" && (
                        <img src={MaleIcon} className="w-14 h-14" />
                      )}
                      {this.state.client.gender.toUpperCase() === "FEMALE" && (
                        <img src={FemaleIcon} className="w-14 h-14 " />
                      )}
                      {this.state.client.gender.toUpperCase() === "OTHER" && (
                        <img src={GenOIcon} className="w-14 h-14 " />
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <img
                          className={`w-8 h-8 rounded-full flag:${this.state.client.country.toUpperCase()}`}
                        />
                        <div className="text-base font-bold text-white ml-2">
                          {Object.entries(countries).map(([key, value]) => {
                            if (key == country) {
                              return value.name;
                            }
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute flex flex-col w-full bottom-0 left-0 pb-10 ">
                <div className="flex justify-center ">
                  <div
                    className="bg-red-500 m-2 rounded-full cursor-pointer"
                    onClick={async () => {
                      await this.props.dispatch(GoOffline());
                      this.DisconnectCall();
                    }}
                  >
                    <FaRegStopCircle size={70} color="white" className="p-2" />
                  </div>
                  <div
                    className="bg-blue-600 m-2 rounded-full cursor-pointer"
                    onClick={async () => {
                      this.props.dispatch(Disconnect());
                    }}
                  >
                    <FaArrowAltCircleRight
                      size={70}
                      color="white"
                      className="p-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* {this.props.calling.connectStatus == CONNECTED && (
          <div className="bg-gray-400">
            <div className="flex flex-row items-center justify-between mx-2 mt-1">
              <BsGearFill size={30} className="cursor-pointer" />
              <div className="flex flex-row flex-grow m-2 p-1 items-center">
                <input
                  type="text"
                  className="border-b p-2 flex-grow mx-2 rounded-md focus:outline-none text-base font-bold "
                  placeholder="Write message here ..."
                />
                <div className="cursor-pointer bg-blue-600 p-2 rounded-3xl text-white">
                  <FaArrowRight size={25} color="white" />
                </div>
              </div>
            </div>
          </div>
        )} */}
        {this.state.showAlerDisconnect && (
          <Alert
            variant="primary"
            className="absolute bottom-0 left-0 right-0 m-auto"
          >
            Opps User left room ...
          </Alert>
        )}
      </div>
    );
  }
}

const CamNotFoundDialog = (props) => {
  return (
    <Dialog
      open={props.display}
      aria-labelledby="simple-dialog-title"
      aria-describedby="alert-dialog-description"
      onClose={() => props.onClose()}
    >
      <DialogTitle id="simple-dialog-title">
        Sorry your device not supporting camera support{" "}
      </DialogTitle>
      <DialogContent id="alert-dialog-description">
        <DialogContentText id="alert-dialog-description">
          To allow camera permission allow requested permission
        </DialogContentText>
      </DialogContent>
      <DialogActions>
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
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state) => {
  return {
    calling: state.calling,
  };
};

export default connect(mapStateToProps, null)(VideoCallPage);
