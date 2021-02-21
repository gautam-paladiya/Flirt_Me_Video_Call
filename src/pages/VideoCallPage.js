import React, { Component } from "react";

import io from "socket.io-client";
import Peer from "peerjs";
import { FaPlay } from "react-icons/fa";
import { Switch } from "@material-ui/core";
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
  StartExit,
  CONNECTED,
  NOTCONNECTED,
  Disconnect,
  DISCONNECT,
  NotConnected,
} from "../store/CallingAction";

import { connect } from "react-redux";

export class VideoCallPage extends Component {
  constructor() {
    super();
    this.state = {
      gender: "MALE",
      terms: false,
      genderModal: false,
      profileModal: false,
    };
  }

  getStream = () => {
    try {
      const stream = navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          return stream;
        })
        .catch((err) => {
          console.log(`erro ${err}`);
        });
      return stream;
    } catch (error) {
      console.log(error);
    }
  };

  initVideo = async () => {
    this.remoteVideo.srcObject = await this.getStream();
  };

  componentDidMount() {
    this.remoteVideo = document.getElementById("remote-video");
    this.localVideo = document.getElementById("local-video");
    this.initVideo();

    this.socket = io("http://192.168.0.220:4000");

    this.peer = new Peer({
      config: {
        iceServers: [
          { url: "stun:stun.l.google.com:19302" },

          { url: "stun:stunserver.org" },
        ],
      },
    });

    this.socket.on("connect", () => {
      console.log(`socket connect id ${this.socket.id} `);
    });

    this.socket.on("requestCall", async (arg, callback) => {
      console.log(`requestCall id ${arg.peerId}`);
      this.props.dispatch(StartConnecting());
      this.dataConnection = await this.peer.connect(arg.peerId);
      console.log(`client id ${this.dataConnection.peer}`);
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

        // Send messages
        // conn.send("Hello!");
      });

      // Receive messages
      this.dataConnection.on("data", (data) => {
        console.log("Received", data);
      });
      this.dataConnection.on("close", async () => {
        console.log("conn close");
        this.DisconnectRemote();

        // await setisActive(true);
        // this.DisconnectCall();
      });
    });

    this.peer.on("open", (id) => {
      console.log("My peer ID is: " + id);
    });

    this.peer.on("connection", (conn) => {
      console.log(`peer connected ${JSON.stringify(conn.open)}`);
      this.props.dispatch(CompleteConnected());
      this.socket.emit("userConnected", {
        connectedTo: this.socket.id,
      });

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
  }
  componentDidUpdate(prevProps, preState) {
    console.log(`update ${this.peer.disconnected}`);
    console.log(`update ${JSON.stringify(prevProps)}`);
    console.log(`update ${JSON.stringify(preState)}`);
  }

  startConnecting = () => {
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
    this.setState({ ...this.state, genderModal: !this.state.genderModal });
  };

  toggleGender = () => {
    this.setState({ ...this.state, profileModal: !this.state.profileModal });
  };

  render() {
    console.log(`props ${JSON.stringify(this.props)}`);
    return (
      <div className="w-screen h-screen flex flex-col bg-black  ">
        <div className="flex w-full h-full relative flex-1 overflow-x-hidden">
          <video
            autoPlay
            id="remote-video"
            className="w-full h-full videoback object-cover"
            width="100"
            height="100"
          />

          {!this.props.calling.isActive && (
            <div className="opacity-80 w-full h-full flex flex-col items-center justify-center space-y-9 absolute">
              <h1 className="text-5xl lg:font-6xl font-bold text-red-500 ">
                Flirt Me Baby
              </h1>
              <h2 className="text-white font-extrabold">
                856,546 joined Flirt Me Baby
              </h2>
              <div className="flex flex-row w-full justify-center space-x-3">
                <div
                  className=" p-2 cursor-pointer rounded-lg shadow-md bg-gray-100 text-black text-base font-bold w-1/3 flex items-center justify-center"
                  onClick={() => this.toggleGender()}
                >
                  I AM : {this.state.gender}
                </div>
                <div
                  className="p-2 cursor-pointer rounded-lg shadow-md bg-blue-500 text-white text-base font-bold w-1/3 flex items-center justify-center"
                  onClick={() => {
                    this.socket.emit("online");
                    this.startConnecting();
                  }}
                >
                  <FaPlay size={25} className="text-white mr-3" />
                  {"   "} Start
                </div>
              </div>
              <div className="flex bg-white rounded-lg p-1 items-center mt-5">
                <Switch
                  checked={this.state.terms}
                  onChange={(e) => {
                    this.setState({ ...this.state, terms: e.target.checked });
                  }}
                  color="primary"
                  name="checkedA"
                  inputProps={{ "aria-label": "primary checkbox" }}
                />
                <p>
                  I certify I have read and agree to the <u>Terms of Use</u> and
                  Guidelines.
                </p>
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
            <div className=" absolute w-full bottom-0">
              <div className="flex justify-center ">
                <div
                  className="bg-red-500 m-2 rounded-full cursor-pointer"
                  onClick={async () => {
                    await this.props.dispatch(GoOffline());
                    this.DisconnectCall();
                  }}
                >
                  <FaRegStopCircle size={60} color="white" className="p-2" />
                </div>
                <div
                  className="bg-blue-600 m-2 rounded-full cursor-pointer"
                  onClick={async () => {
                    this.props.dispatch(Disconnect());
                  }}
                >
                  <FaArrowAltCircleRight
                    size={60}
                    color="white"
                    className="p-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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
