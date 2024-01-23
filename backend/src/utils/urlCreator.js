import { SRT_URL } from "../constants.js";

const urlCreator = (_id) => {
  console.log(`${SRT_URL}/${_id}`);
  return `${SRT_URL}/${_id}`;
};

export { urlCreator };
