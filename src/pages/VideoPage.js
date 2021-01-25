import React, { useState, useEffect, useRef, StyleSheet } from "react";
import io from "socket.io-client";
import Peer from "peerjs";
import Video1 from "../assets/videos/no_con_1.mp4";
import Giphy from "../assets/videos/giphy.gif";
import Rodal from "rodal";
import SelectGenderComponent from "../Components/SelectGenderComponent";
import { FaPlay } from "react-icons/fa";
import { Switch } from "@material-ui/core";
import { BsGearFill } from "react-icons/bs";
import {
  FaArrowRight,
  FaRegStopCircle,
  FaArrowAltCircleRight,
} from "react-icons/fa";
import AndroidIcon from "../assets/images/androidIcon.png";
import IosIcon from "../assets/images/ios.svg";
import LoginRegisterComponent from "../Components/LoginRegisterComponent";
import {} from "./styles.css";

function VideoPage() {
  const status = {
    NOTCONNECTED: "Not Connected",
    CONNECTING: "Searching for Partner",
    CONNECTED: "Connection Established",
    DISCONNECTED: "Disconnected",
  };

  const initialState = {
    local: "",
    remote: "",
    myId: "",
    socketId: "",
    peerId: "",
    users: {},
    clientPeerId: "",
    initScreen: true,
    connectStatus: status.NOTCONNECTED,
  };

  const initialProfile = {
    gender: "MALE",
    terms: false,
  };

  const customStyles = {
    width: "auto",
    height: "auto",
    margin: 0,
    top: "10%",
    bottom: "10%",
    left: "25%",
    right: "25%",
    overflow: "scroll",
    overflowX: "hidden",
  };

  const [state, setstate] = useState(initialState);
  const [selectGender, setselectGender] = useState(false);
  const [toggleAuthModel, settoggleAuthModel] = useState(false);
  const [profile, setprofile] = useState(initialProfile);
  const socket = useRef();
  const peer = useRef();
  const localVideo = useRef();
  const remoteVideo = useRef();

  const initVideo = async () => {
    // navigator.getUserMedia =
    //   navigator.getUserMedia ||
    //   navigator.webkitGetUserMedia ||
    //   navigator.mozGetUserMedia ||
    //   navigator.msGetUserMedia ||
    //   navigator.oGetUserMedia;

    remoteVideo.current.srcObject = await getStream();
  };

  const initLocalVideo = () => {
    if (remoteVideo.current.hasAttribute("src")) {
      remoteVideo.current.removeAttribute("src");
    }
    var source = document.createElement("source");
    source.setAttribute("src", Video1);
    remoteVideo.current.appendChild(source);
    remoteVideo.current.muted = true;
    remoteVideo.current.onended = function () {
      this.load();
      this.play();
    };
  };

  const getStream = () => {
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
      handleError(error);
    }
  };

  const constraints = (window.constraints = {
    audio: false,
    video: true,
  });

  function handleError(error) {
    if (error.name === "ConstraintNotSatisfiedError") {
      const v = constraints.video;
      errorMsg(
        `The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`
      );
    } else if (error.name === "PermissionDeniedError") {
      errorMsg(
        "Permissions have not been granted to use your camera and " +
          "microphone, you need to allow the page access to your devices in " +
          "order for the demo to work."
      );
    }
    errorMsg(`getUserMedia error: ${error.name}`, error);
  }

  function errorMsg(msg, error) {
    const errorElement = document.querySelector("#errorMsg");
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== "undefined") {
      console.error(error);
    }
  }

  useEffect(() => {
    // navigator.geolocation.getCurrentPosition((position) => {
    //   console.log(
    //     `lat=${position.coords.latitude}&lon=${position.coords.longitude}`
    //   );
    // });

    remoteVideo.current = document.getElementById("remote-video");
    localVideo.current = document.getElementById("local-video");

    // initLocalVideo();
    initVideo();
    socket.current = io("http://192.168.0.220:4000");
    socket.current.on("connect", () => {
      console.log(`socket connect id ${socket.current.id} `);
      console.log(`peer connect id ${peer.current.id} `);
      setstate({ ...state, socketId: socket.id });
    });

    socket.current.on("yourID", (id) => {
      setstate({ ...state, myId: id });
    });

    socket.current.on("allUsers", (users) => {
      console.log(users);
      setstate({ ...state, users: users });
    });

    socket.current.on("requestCall", (arg, callback) => {
      console.log(`id ${arg.peerId}`);
      const conn = peer.current.connect(arg.peerId);
      // setstate({ ...state, clientPeerId: peerId });
      conn.on("open", async function () {
        console.log(`con open ${conn.peer} `);
        setstate({ ...state, connectStatus: status.CONNECTED });

        socket.current.emit("userConnected", { connectedTo: conn.peer });

        // Receive messages
        conn.on("data", function (data) {
          console.log("Received", data);
        });

        const call = peer.current.call(arg.peerId, await getStream());
        call.on("stream", async (remoteStream) => {
          // Show stream in some <video> element.
          remoteVideo.current.srcObject = remoteStream;
          localVideo.current.srcObject = await getStream();
          // remoteVideo.load();
          // remoteVideo.play();
        });

        // Send messages
        // conn.send("Hello!");
      });
    });
    peer.current = new Peer({
      config: {
        iceServers: [
          { url: "stun:stun.l.google.com:19302" },

          { url: "stun:stunserver.org" },
        ],
      },
    });
    peer.current.on("open", function (id) {
      console.log("My peer ID is: " + id);
      // setstate({ ...state, peerId: id });
    });

    peer.current.on("connection", (conn) => {
      console.log(`peer connected ${conn.peer}`);
      setstate({ ...state, connectStatus: status.CONNECTED });
      socket.current.emit("userConnected", { connectedTo: conn.peer });

      conn.on("data", (data) => {
        // Will print 'hi!'
        console.log(data);
      });
      conn.on("open", () => {
        console.log("peer open");
        // conn.send({ peerId: peer.current.id });
      });
    });

    peer.current.on("call", async (call) => {
      call.answer(await getStream()); // Answer the call with an A/V stream.
      call.on("stream", async (remoteStream) => {
        // Show stream in some <video> element.
        remoteVideo.current.srcObject = remoteStream;
        localVideo.current.srcObject = await getStream();
        // remoteVideo.load();
        // remoteVideo.play();
      });
    });

    peer.current.on("error", (errr) => {
      console.log(`peer erro ${JSON.stringify(errr)}`);
    });

    peer.current.on("disconnected", () => {
      console.log("peer disconnected");
      setstate({ ...state, connectStatus: status.DISCONNECTED });

      initLocalVideo();
      socket.current.emit("startDisconnect", {
        peerId: peer.current.id,
      });
    });

    window.addEventListener("load", function () {
      setTimeout(function () {
        // This hides the address bar:
        window.scrollTo(0, 1);
      }, 0);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const startConnecting = () => {
    console.log("start connecting");
    socket.current.emit("start", {
      peerId: peer.current.id,
    });
    setstate({ ...state, connectStatus: status.CONNECTING });
  };

  const startDisconnecting = () => {
    // console.log(`start dis connecting ${peer.current.connections}`);
    setstate({ ...state, connectStatus: status.NOTCONNECTED });
    if (peer.current.connections) {
      console.log("disconnect");
      peer.current.disconnect();
    }
  };

  console.log(`sate ${JSON.stringify(state)}`);

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

        {state.connectStatus == status.NOTCONNECTED && (
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
                onClick={() => setselectGender(!selectGender)}
              >
                I AM : {profile.gender}
              </div>
              <div
                className="p-2 cursor-pointer rounded-lg shadow-md bg-blue-500 text-white text-base font-bold w-1/3 flex items-center justify-center"
                onClick={() => startConnecting()}
              >
                <FaPlay size={25} className="text-white mr-3" />
                {"   "} Start
              </div>
            </div>
            <div className="flex bg-white rounded-lg p-1 items-center mt-5">
              <Switch
                checked={state.checkedB}
                onChange={(e) => {
                  setprofile({ ...profile, terms: e.target.checked });
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
                state.connectStatus == status.CONNECTED ? "visible" : "hidden",
            }}
          />
        </div>

        {state.connectStatus !== status.NOTCONNECTED && (
          <div className=" absolute w-full bottom-0">
            <div className="flex justify-center ">
              <div
                className="bg-red-500 m-2 rounded-full cursor-pointer"
                onClick={startDisconnecting}
              >
                <FaRegStopCircle size={60} color="white" className="p-2" />
              </div>
              <div className="bg-blue-600 m-2 rounded-full cursor-pointer">
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

export default VideoPage;
