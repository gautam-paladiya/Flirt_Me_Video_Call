import { Dialog } from "@material-ui/core";
import { countries } from "countries-list";
import React from "react";
import cookie from "react-cookies";
import { GoogleLogout } from "react-google-login";

function ProfileDialogComponent(props) {
  const { onClose, display } = props;

  const token = cookie.load("id");

  const imgSrc = localStorage.getItem("picture");
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email");
  const country = localStorage.getItem("country");
  const loginType = localStorage.getItem("signUpType");

  const doLogout = (res) => {
    console.log(res);
    window.FB.logout();
    cookie.remove("id");
    localStorage.removeItem("picture");
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("terms");
    localStorage.removeItem("email");
    localStorage.removeItem("gender");
    localStorage.removeItem("signUpType");
    onClose();
  };

  return (
    <Dialog open={display} onClose={onClose}>
      <div className="flex flex-col items-center p-5 overflow-hidden">
        <img src={imgSrc} className="w-20 h-20 m-10 rounded-full" />
        <div className="text-lg font-bold caps m-3">{name}</div>
        <div className="flex items-center justify-between mt-2">
          <img className={`w-8 h-8 rounded-full flag:${country}`} />
          <div className="text-base font-bold text-white ml-2">
            {Object.entries(countries).map(([key, value]) => {
              if (key == country) {
                return value.name;
              }
            })}
          </div>
        </div>

        {loginType == "google" ? (
          <GoogleLogout
            clientId={process.env.REACT_APP_GOOGLE_ID}
            buttonText="Logout"
            onLogoutSuccess={doLogout}
            render={(renderProps) => {
              return (
                <div
                  className="bg-red-600 text-white font-bold px-3 py-2  m-3 cursor-pointer rounded-2xl"
                  onClick={() => renderProps.onClick()}
                >
                  Logout Google
                </div>
              );
            }}
          />
        ) : (
          <div
            className="bg-red-600 text-white font-bold px-3 py-2  m-3 cursor-pointer rounded-2xl"
            onClick={() => doLogout()}
          >
            Logout
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default ProfileDialogComponent;
