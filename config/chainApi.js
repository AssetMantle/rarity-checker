import { Base64 } from "js-base64";
import base64url from "base64url";
("base64url");
// import base64url from "base64url";

export const validateAssetId = (assetId) => {
  if (!assetId) return false;
  var base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  console.log("base64 decoded: ", base64regex.test(assetId));
  return base64regex.test(assetId);
};
