import React, { Component } from "react";
import { countries } from "countries-list";

import io from "socket.io-client";
import Peer from "peerjs";
import { FaPlay, FaGlobe, FaCaretDown } from "react-icons/fa";

import { BsGearFill } from "react-icons/bs";
import {
  FaArrowRight,
  FaRegStopCircle,
  FaArrowAltCircleRight,
} from "react-icons/fa";
import {
  CompleteConnected,
  GoOffline,
  GoOnline,
  StartConnecting,
  StartWaiting,
  StopConnecting,
  CONNECTED,
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
import ComponentFacebookButton from "../../Components/ComponentFacebookButton";
import ComponentGoogleButton from "../../Components/ComponentGoogleButton";
import cookie from "react-cookies";
import LogHelper from "../../utils/LogHelper";
import CamNotFoundDialogComponent from "./CamNotFoundDialogComponent";

const stripePromise = loadStripe("pk_test_6pRNASCoBOKtIshFeQd4XMUh");
const CALLER = "CALLER";
const RECEIVER = "RECEIVER";

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
      type: CALLER,
    };
    this.termRef = React.createRef();
  }

  token = cookie.load("id");

  //  {
  //               frameRate: quality ? quality : 12,
  //               noiseSuppression: true,
  //               width: {min: 640, ideal: 1280, max: 1920},
  //               height: {min: 480, ideal: 720, max: 1080}
  //           }

  getStream = (audio = true, video = true) => {
    try {
      const myNavigator =
        navigator.mediaDevices.getUserMedia ||
        navigator.mediaDevices.webkitGetUserMedia ||
        navigator.mediaDevices.mozGetUserMedia ||
        navigator.mediaDevices.msGetUserMedia;
      const stream = myNavigator({
        video: video ? { noiseSuppression: true } : false,
        audio: audio,
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
    var stream = await this.getStream(false, true);
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
        } else {
          this.setState({ ...this.state, country: "US" }, () => {
            localStorage.setItem("country", "US");
          });
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

    console.log(`${process.env.REACT_APP_SERVER_HOST}`);
    this.socket = io(`${process.env.REACT_APP_SERVER_HOST}`);

    this.peer = new Peer({
      host: process.env.REACT_APP_PEER_URL,
      port: 80,
      path:'myapp',
      config: {
        iceServers: [{ url: "stun:stun.l.google.com:19302" }],
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
      this.setState({ ...this.state, type: RECEIVER });
      this.dataConnection = await this.peer.connect(arg.peerId);

      this.dataConnection.on("open", async (clientPeerId) => {
        this.props.dispatch(CompleteConnected());

        this.socket.emit("userConnected", {
          connectedTo: arg.socketId,
        });

        this.mediaConnection = await this.peer.call(
          this.dataConnection.peer,
          await this.getStream(true, true)
        );
        this.mediaConnection.on("stream", async (remoteStream) => {
          // Show stream in some <video> element.
          this.remoteVideo.srcObject = remoteStream;
          this.localVideo.srcObject = await this.getStream(false, true);
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

        if (this.props.calling.isActive) {
          this.DisconnectRemote();
          this.showAlert();
          this.startConnecting();
        }
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
      this.dataConnection = conn;

      this.dataConnection.on("data", (data) => {
        // Will print 'hi!'
        console.log(data);
      });
      this.dataConnection.on("open", () => {
        console.log("peer open");
        // conn.send({ peerId: this.peer.id });
      });
      this.dataConnection.on("close", async () => {
        console.log("conns close");
        // await setisActive(true);
        // this.DisconnectCall();
        if (this.props.calling.isActive) {
          this.DisconnectRemote();
          this.showAlert();
          this.startConnecting();
        }
      });
    });

    this.peer.on("call", async (call) => {
      this.mediaConnection = call;
      this.mediaConnection.answer(await this.getStream(true, true)); // Answer the call with an A/V stream.
      this.mediaConnection.on("stream", async (remoteStream) => {
        // Show stream in some <video> element.
        this.remoteVideo.srcObject = remoteStream;
        this.localVideo.srcObject = await this.getStream(false, true);

        // remoteVideo.load();
        // remoteVideo.play();
      });
      this.mediaConnection.on("close", () => {
        console.log("medias close");
        // disconnect();
      });
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
    window.addEventListener(
      "blur",
      () => {
        this.doSomethingBeforeUnload();
      },
      false
    );
    window.addEventListener("beforeunload", (ev) => {
      ev.preventDefault();
      return this.doSomethingBeforeUnload();
    });

    console.log(`NODE ${process.env.NODE_ENV}`);
  }
  // componentDidUpdate(prevProps, preState) {
  //   // console.log(`update ${this.peer.disconnected}`);
  //   // console.log(`update ${JSON.stringify(prevProps)}`);
  //   // console.log(`update ${JSON.stringify(preState)}`);
  // }

  doSomethingBeforeUnload = async () => {
    await this.props.dispatch(GoOffline());
    this.DisconnectCall();
  };

  setupBeforeUnloadListener = () => {};

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
    this.dataConnection.close();
    this.mediaConnection.close();
    // this.peer.disconnect();
    this.initVideo();
    this.socket.emit(
      "disconnected",
      { isAvailable: this.props.calling.isActive },
      (res) => {
        this.props.dispatch(StopConnecting());
        console.log("database dis connected ", this.props.calling.isActive);
        this.setState({ ...this.state, client: {} });
      }
    );
  };

  DisconnectCall = () => {
    if (this.props.calling.connected) {
      console.log("con found");
      this.dataConnection.close();
      this.mediaConnection.close();
      // this.peer.disconnect();
      this.initVideo();
    }
    this.props.dispatch(StopConnecting());

    this.socket.emit(
      "disconnected",
      { isAvailable: this.props.calling.isActive },
      (res) => {
        console.log("User did disconnect", this.props.calling.isActive);
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
    console.log(e);
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
    if (cookie.load("id")) {
      this.handleToggleProfileDialog();
    } else {
      this.setState({
        ...this.state,
        showLoginRegister: !this.state.showLoginRegister,
      });
    }
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
    LogHelper(`NODE ${JSON.stringify(this.state)}`);

    return (
      <div className="w-screen h-screen flex flex-col bg-black overflow-hidden  ">
        <CamNotFoundDialogComponent
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
          {/* <img src="/bg.jpg" className="w-full h-full object-cover" /> */}

          {!this.props.calling.isActive && (
            <div className="flex flex-col items-center justify-center space-y-9 absolute top-0 left-0 h-full w-full px-3">
              <img src="/logo.png" className="w-52 h-48 " />
              <h1 className="text-7xl lg:font-7xl font-bold text-red-600 font-Love text-center  ">
                {process.env.REACT_APP_NAME}
              </h1>
              <h2 className="text-yellow-300 font-extrabold text-xl font-serif">
                856,546 joined {process.env.REACT_APP_NAME}
              </h2>
              <div className="flex flex-row w-full justify-center space-x-3 my-10 ">
                <div
                  className=" font-serif px-3 py-2 cursor-pointer rounded-lg shadow-md bg-gray-100 text-black text-xl font-extrabold  flex items-center justify-center"
                  onClick={() => this.toggleGender()}
                >
                  I AM : {this.state.gender || "?"}
                </div>
                <div
                  onClick={() => {
                    this.socket.emit("online");
                    this.startConnecting();
                  }}
                  className=" font-serif px-3 py-2 cursor-pointer rounded-lg shadow-md bg-gray-100 text-black text-2xl font-extrabold  flex items-center justify-center"
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
                <ComponentGoogleButton>
                  <img
                    src={GoogleIcon}
                    className="w-16 h-16 rounded-full bg-white p-2 cursor-pointer"
                  />
                </ComponentGoogleButton>
                <ComponentFacebookButton>
                  <FaFacebook
                    size={64}
                    className="p-2 bg-blue-700 rounded-full text-white cursor-pointer"
                  />
                </ComponentFacebookButton>
                <div
                  onClick={() => this.handleLoginRegisterDialog()}
                  className="p-2 bg-white rounded-full cursor-pointer"
                >
                  <FaEnvelope size={45} />
                </div>
              </div>
            </div>
          )}

          {/* <div className="hidden absolute w-full lg:flex bg-dark-gray  items-center bg-gray-900 p-5 justify-around">
            <img src={AndroidIcon} className="w-48 h-20" />
            <img src={IosIcon} className="w-48 h-20" />
          </div> */}

          <div
            className="absolute bg-transparent w-1/3 h-1/4 lg:w-2/5 lg:h-2/4  mb-2 mr-2 bottom-0 right-0"
            style={{
              visibility:
                this.props.calling.connectStatus == CONNECTED
                  ? "visible"
                  : "hidden",
            }}
          >
            <video
              autoPlay
              id="local-video"
              className="w-full h-full min-h-full  bg-transparent object-cover "
            />
          </div>

          {this.props.calling.isActive && (
            <div className="">
              <div className="flex flex-col  absolute top-0 left-0 right-0 justify-between items-center ">
                <div className="flex space-x-2 p-2 lg:z-50 lg:relative">
                  <div
                    className="p-2 cursor-pointer rounded-lg shadow-md bg-gray-100 text-black text-base lg:text-lg font-bold  flex items-center justify-center"
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
                    className=" font-mono p-2 cursor-pointer rounded-lg shadow-md bg-gray-100 text-black text-base lg:text-lg font-bold flex items-center justify-center"
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

                <div className="flex  items-center justify-between w-full p-2 lg:absolute lg:top-0 lg:right-0 lg:left-0 z-0">
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
                          className={`w-8 h-8 rounded-full flag:${this.state.client.country}`}
                        />
                        <div className="text-base font-bold text-white ml-2">
                          {Object.entries(countries).map(([key, value]) => {
                            if (key == this.state.client.country) {
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
                    onClick={() => this.DisconnectCall()}
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

const mapStateToProps = (state) => {
  return {
    calling: state.calling,
  };
};

export default connect(mapStateToProps, null)(VideoCallPage);
