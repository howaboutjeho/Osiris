// import '../assets/css/TopContainer.css';
import React, { useState, useEffect } from "react";
import BuildItem from "../components/BuildItem.jsx";
import createFiles from "../utils/createFiles.js";
import componentRender from "../utils/componentRender.js";
import vueComponentRender from "../utils/vueComponentRender.js";
import { Context } from "../context/MyProvider.js";
const IPC = require("electron").ipcRenderer;

const CodeDisplayContainer = (props) => {
  const [DLFileName, setDLFileName] = useState("");
  const [selectedState, setSelectedState] = useState("noState");
  const [path, setPath] = useState("");
  const [codeStr, setCodeStr] = useState("");
  const [language, setLanguage] = useState("react");

  const { globalState, dispatch } = React.useContext(Context);
  let { items } = props;

  useEffect(() => {
    console.log("useEffect props: ", props);
    console.log("useEffect renderCode", props.items);
    if (props.items !== undefined) {
      console.log("rendercode");
      renderCode(props.items);
    }
  }, [props.items]);

  function clear() {
    dispatch({
      type: "clearCode",
    });
    setDLFileName("");
    setSelectedState("noState");
    setPath("");
    setCodeStr("");
    setLanguage("react");
  }

  function handleDownload() {
    let codeStr = renderCode(items);
    console.log(`codeStr `, codeStr);
    createFiles(codeStr, path, DLFileName, selectedState);
    alert("File Downloaded! Osiris is pieced together again, thank you!");
    clear();
  }

  function onChangeDL(e) {
    setDLFileName(e.target.value);
  }

  function languageDropDown(e) {
    console.log(e.target.value);
    setLanguage(e.target.value);
    renderCode(items, selectedState, e.target.value);
  }
  function handleDropDown(e) {
    setSelectedState(e.target.value);
    renderCode(items, e.target.value, language);
  }

  function pickDirectory(e) {
    IPC.on("app_dir_selected", (event, path) => {
      setPath(path);
      // createFiles(items, path, DLFileName, selectedState)
    });
    IPC.send("choose_app_dir");
  }

  function renderCode(
    items,
    stateSelection = selectedState,
    language = "react"
  ) {
    let code = "";

    items.forEach((item) => {
      //base case, not nested
      if (Array.isArray(item)) {
        // if nested [[{div},{button}]]
        code += handleNested(item, code);
      } else {
        //close type tag
        code += `\n\t\t${item.react_code}`;
      }
    });

    console.log("selectedState ", stateSelection);
    console.log("DLFileName ", DLFileName);
    if (language === "react") {
      const reactCode = componentRender(code, stateSelection, DLFileName);
      setCodeStr(reactCode);
      console.log("componentRenderer result: ", reactCode);
      return reactCode;
    }
    if (language === "vue") {
      const vueCode = vueComponentRender(code, stateSelection, DLFileName);
      setCodeStr(vueCode);
      console.log("componentRenderer result: ", vueCode);
      return vueCode;
    }
  }

  function handleNested(items) {
    let openingHalf = "\n\t\t<div>";
    let closingHalf = "\n\t\t</div>";
    let counter = 0;
    // loop through each item
    for (let i = 1; i < items.length; i += 1) {
      if (items[i].type === "div") {
        openingHalf += "\n\t\t\t<div>";
        closingHalf = "\n\t\t\t</div>" + closingHalf;
        counter++;
      } else {
        if (counter === 0) {
          openingHalf += `\n\t\t\t${items[i].react_code}`;
        } else {
          openingHalf += `\n\t\t\t\t${items[i].react_code}`;
        }
      }
    }

    return openingHalf + closingHalf;
  }

  return (
    <div className="codeDisplay">
      <div className="codeDisplayContainer">
        <h1>CODE DISPLAY</h1>
        <pre>
          <code>{codeStr}</code>
        </pre>
      </div>
      <div className="downloadButton">
        <select
          name="languageSelection"
          default="react"
          onChange={languageDropDown}
        >
          <option value="react">React</option>
          <option value="vue">Vue</option>
        </select>
        {language === "react" && (
          <select
            name="stateSelection"
            id="stateOptions"
            onChange={handleDropDown}
            default="noState"
          >
            <option value="noState">No State</option>
            <option value="classState">Class</option>
            <option value="hooksState">Hooks</option>
          </select>
        )}
        {language === "vue" && (
          <select
            name="stateSelection"
            id="stateOptions"
            onChange={handleDropDown}
            default="noState"
          >
            <option value="noState">No State</option>
            <option value="state">State</option>
          </select>
        )}
        <input
          type="text"
          value={DLFileName}
          placeholder="e.g. Button, Div"
          onChange={onChangeDL}
        />
        <button onClick={pickDirectory}>Pick Directory</button>
        <button onClick={handleDownload}>Download</button>
        <button onClick={clear}>Clear</button>
      </div>
    </div>
  );
};

export default CodeDisplayContainer;
