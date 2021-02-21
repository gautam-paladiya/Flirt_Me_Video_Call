import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import io from "socket.io-client";
import Peer from "peerjs";
import SelectGenderComponent from "../Components/SelectGenderComponent";
import { FaPlay } from "react-icons/fa";
import { Switch } from "@material-ui/core";
import { BsGearFill } from "react-icons/bs";
import {
  FaArrowRight,
  FaRegStopCircle,
  FaArrowAltCircleRight,
} from "react-icons/fa";
import LoginRegisterComponent from "../Components/LoginRegisterComponent";
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

const initialProfile = {
  gender: "MALE",
  terms: false,
};

function VideoPage() {
  const [selectGender, setselectGender] = useState(false);
  const [toggleAuthModel, settoggleAuthModel] = useState(false);
  const [profile, setprofile] = useState(initialProfile);
  const [ConnectedState, setConnectedState] = useState(false);
  const [IsActive, setIsActive] = useState(false);

  const calling = useSelector((state) => state.calling);
  const callingRef = useRef(calling);
  const dispatch = useDispatch();

  const socket = useRef();
  const peer = useRef();
  const localVideo = useRef();
  const remoteVideo = useRef();
  const mediaConnection = useRef();
  const dataConnection = useRef();

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
    // source.setAttribute("src", Video1);
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
      console.log(error);
    }
  };

  useEffect(() => {
    remoteVideo.current = document.getElementById("remote-video");
    localVideo.current = document.getElementById("local-video");

    // initLocalVideo();
    initVideo();
    socket.current = io("http://192.168.0.220:4000");

    peer.current = new Peer({
      config: {
        iceServers: [
          { url: "stun:stun.l.google.com:19302" },

          { url: "stun:stunserver.org" },
        ],
      },
    });

    window.addEventListener("load", function () {
      setTimeout(function () {
        // This hides the address bar:
        window.scrollTo(0, 1);
      }, 0);
    });
  }, []);

  console.log("useEffect out");

  useEffect(() => {
    console.log("useEffect in");

    socket.current.on("connect", () => {
      console.log(`socket connect id ${socket.current.id} `);
    });

    socket.current.on("requestCall", async (arg, callback) => {
      console.log(`requestCall id ${arg.peerId}`);
      dispatch(StartConnecting());
      dataConnection.current = await peer.current.connect(arg.peerId);
      // console.log(`client id ${dataConnection.current.peer}`);
      dataConnection.current.on("open", async function () {
        dispatch(CompleteConnected());

        socket.current.emit("userConnected", {
          connectedTo: arg.socketId,
        });

        mediaConnection.current = await peer.current.call(
          dataConnection.current.peer,
          await getStream()
        );
        mediaConnection.current.on("stream", async (remoteStream) => {
          // Show stream in some <video> element.
          remoteVideo.current.srcObject = remoteStream;
          localVideo.current.srcObject = await getStream();
        });
        mediaConnection.current.on("close", function () {
          console.log("media close");
        });

        // Send messages
        // conn.send("Hello!");
      });

      // Receive messages
      dataConnection.current.on("data", function (data) {
        console.log("Received", data);
      });
      dataConnection.current.on("close", async function () {
        console.log("conn close");
        // await setisActive(true);
        dispatch(Disconnect());
        DisconnectCall();
      });
    });

    peer.current.on("open", function (id) {
      console.log("My peer ID is: " + id);
    });

    peer.current.on("connection", (conn) => {
      console.log(`peer connected ${JSON.stringify(conn.open)}`);
      dispatch(CompleteConnected());
      socket.current.emit("userConnected", { connectedTo: socket.current.id });

      conn.on("data", (data) => {
        // Will print 'hi!'
        console.log(data);
      });
      conn.on("open", () => {
        console.log("peer open");
        // conn.send({ peerId: peer.current.id });
      });
      conn.on("close", async function () {
        console.log("conns close");
        // await setisActive(true);
        dispatch(Disconnect());
        DisconnectCall();
      });
      dataConnection.current = conn;
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
      call.on("close", function () {
        console.log("medias close");
        // disconnect();
      });
      mediaConnection.current = call;
    });

    peer.current.on("error", (errr) => {
      console.log(`peer erro ${JSON.stringify(errr)}`);
    });

    peer.current.on("close", function () {
      console.log("peer close");
      // disconnect();
      // peer.current.disconnect();
    });

    peer.current.on("error", function (err) {
      console.log(`peer erro ${err.type}`);
    });

    peer.current.on("disconnected", () => {
      console.log("peer disconnected");

      socket.current.emit(
        "disconnected",
        { isAvailable: callingRef.current.isActive },
        async (res) => {
          dispatch(NotConnected());
          dispatch(StopConnecting());
          console.log("database disconnected ", callingRef.current.isActive);
          if (callingRef.current.isActive) {
            startConnecting();
          }
        }
      );
    });
  }, [calling]);

  const startConnecting = () => {
    console.log("start connecting");
    dispatch(GoOnline());
    socket.current.emit(
      "start",
      {
        peerId: peer.current.id,
      },
      (response) => {
        console.log(response.message);

        if (response.userFound) {
          dispatch(StartConnecting());
        } else {
          dispatch(StartWaiting());
        }
      }
    );
  };

  const DisconnectCall = () => {
    console.log(`DisconnectCall ${callingRef.current.connected}`);
    if (callingRef.current.connected) {
      console.log("con found");
      dataConnection.current.close();
      peer.current.disconnect();
      // peer.current.destroy();
      initVideo();
      dispatch(NotConnected());
    } else {
      console.log("con found not", callingRef.current.isActive);

      socket.current.emit(
        "disconnected",
        { isAvailable: callingRef.current.isActive },
        (res) => {
          dispatch(NotConnected());
          dispatch(StopConnecting());
          console.log("database dis connected ", calling.isActive);
        }
      );
    }
  };

  console.log(`sate ${JSON.stringify(calling)}`);

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

        {!calling.isActive && (
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
                onClick={() => {
                  socket.current.emit("online");
                  startConnecting();
                }}
              >
                <FaPlay size={25} className="text-white mr-3" />
                {"   "} Start
              </div>
            </div>
            <div className="flex bg-white rounded-lg p-1 items-center mt-5">
              <Switch
                checked={profile.terms}
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
                calling.connectStatus == CONNECTED ? "visible" : "hidden",
            }}
          />
        </div>

        {calling.isActive && (
          <div className=" absolute w-full bottom-0">
            {ConnectedState && <p className="text-lg font-bold">Connected</p>}
            <div className="flex justify-center ">
              <div
                className="bg-red-500 m-2 rounded-full cursor-pointer"
                onClick={async () => {
                  dispatch(GoOffline());
                  dispatch(StopConnecting());
                  DisconnectCall();
                }}
              >
                <FaRegStopCircle size={60} color="white" className="p-2" />
              </div>
              <div
                className="bg-blue-600 m-2 rounded-full cursor-pointer"
                onClick={async () => {
                  dispatch(Disconnect());
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

export default VideoPage;
