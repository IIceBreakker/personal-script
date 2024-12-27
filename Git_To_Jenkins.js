// ==UserScript==
// @name         Git To Jenkins
// @namespace    http://tampermonkey.net/
// @version      2024-12-27
// @description  try to take over the world!
// @author       You
// @match        http://112.111.20.89:30024/*
// @match        http://192.168.8.48/*/*/-/tags/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tencent.com
// @grant    GM_openInTab
// @updateURL    https://github.com/IIceBreakker/personal-script/blob/main/Git_To_Jenkins.js
// @downloadURL    https://github.com/IIceBreakker/personal-script/blob/main/Git_To_Jenkins.js
// ==/UserScript==

(function () {
  'use strict';

  let serverMap = {
    "gpmscloud-agtender-service": "GPFA-AGTENDER",
    "gpmscloud-procurement-service": "GPMS-PROCUREMENT",
    "gpx-basic-platform": "GPX-BASIC-PLATFORM",
    "gpmscloud-bidconfirm-server":"GPX-BIDCONFIRM",
    "gpx-basic-platform":"GPX-BASIC-PLATFORM",
    "gpx-tender-server":"GPX-TENDER"
  }

  let serviceNameInputEle = document.getElementsByClassName("jenkins-select__input")[0];
  let tagNameInputEle = document.getElementsByClassName("jenkins-input")[0];
  let mreInputEle = document.getElementsByClassName("jenkins-select__input")[1];
  let jdkInputEle = document.getElementsByClassName("jenkins-select__input")[2];
  let installDeployInputEle = document.getElementsByClassName("jenkins-select__input")[3];
  let relVerInputEle = null;
  if (document.getElementsByClassName("active-choice")[0] != undefined) {
    relVerInputEle = document.getElementsByClassName("active-choice")[0].querySelector("select");
  }

  function createConfirmDialog() {
    let dialog = document.createElement('div');
    if (document.getElementsByClassName('confirm-dialog').length > 0) {
      return
    }
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
      <div class="dialog-content">
          <div class="dialog-header">
              <h3>Superb（SB）Jenkins，Confirm Your Build</h3>
          </div>
          <table>
            <tr>
              <td style="font-weight:bold"><span>Server Name : </span></td>
              <td style="color:red;font-weight:bold;padding-left:20px;"><span id="serverName">xxxx</span></td>
            </tr>
            <tr>
              <td style="font-weight:bold"><span>Tag Name : </span></td>
              <td style="color:red;font-weight:bold;padding-left:20px;"><span id="tagName">xxxx</span></td>
            </tr>
            <tr>
              <td style="font-weight:bold"><span>MRE : </span></td>
              <td style="color:red;font-weight:bold;padding-left:20px;"><span id="mreName">xxxx</span></td>
            </tr>
            <tr>
              <td style="font-weight:bold"><span>JDK : </span></td>
              <td style="color:red;font-weight:bold;padding-left:20px;"><span id="jdkName">xxxx</span></td>
            </tr>
            <tr>
              <td style="font-weight:bold"><span>REL_VER : </span></td>
              <td style="color:red;font-weight:bold;padding-left:20px;"><span id="relVer">xxxx</span></td>
            </tr>
            <tr>
              <td style="font-weight:bold"><span>INSTALL_DEPLOY : </span></td>
              <td style="color:red;font-weight:bold;padding-left:20px;"><span id="installDeploy">xxxx</span></td>
            </tr>
            <tr>
              <td style="font-weight:bold"><span>IMAGE NAME : </span></td>
              <td style="color:red;font-weight:bold;padding-left:20px;"><span id="imageName">xxxx</span></td>
            </tr>
          </table>
          <div class="dialog-footer">
              <button class="confirm-btn">Confirm</button>
              <button class="cancel-btn">Cancel</button>
          </div>
      </div>
      `;
    document.body.appendChild(dialog);

    document.getElementsByClassName("jenkins-form")[0].querySelectorAll("input").forEach(function (inputEle) {
      inputEle.disabled = true;
    })
    document.getElementsByClassName("jenkins-form")[0].querySelectorAll("select").forEach(function (inputEle) {
      inputEle.disabled = true;
    })
    document.querySelector(".jenkins-button--primary").style.display = 'none'

    let date = new Date();
    let year = (date.getFullYear() - 2000).toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    let dateStr = year + (month < 10 ? "0" + month : month) + (day < 10 ? "0" + day : day);
    
    let serverNameDisNode = document.getElementById('serverName');
    let tagNameDisNode = document.getElementById('tagName');
    let mreNameDisNode = document.getElementById('mreName');
    let jdkNameDisNode = document.getElementById('jdkName');
    let relVerDisNode = document.getElementById('relVer');
    let installDeployDisNode = document.getElementById('installDeploy');
    let imageNameDisNode = document.getElementById('imageName');

    serverNameDisNode.innerText = serviceNameInputEle.value;
    tagNameDisNode.innerText = tagNameInputEle.value;
    mreNameDisNode.innerText = mreInputEle.value;
    jdkNameDisNode.innerText = jdkInputEle.value;
    relVerDisNode.innerText = relVerInputEle.value;
    installDeployDisNode.innerText = installDeployInputEle.value;
    imageNameDisNode.innerText = tagNameInputEle.value + "_" + dateStr + "_" + serverMap[serviceNameInputEle.value];

    if (mreInputEle.value == '版本提测') {
      mreNameDisNode.style.color = 'green';
    }
    if (mreInputEle.value == '紧急发版') {
      mreNameDisNode.style.color = 'gray';
    }
    if (mreInputEle.value == '构建部署镜像') {
      mreNameDisNode.style.color = 'red';
    }

    if (tagNameDisNode.innerText.startsWith("V")) {
      tagNameDisNode.style.color = 'green';
      imageNameDisNode.style.color = 'green';
    }

    if (installDeployDisNode.innerText.startsWith("否")) {
      installDeployDisNode.style.color = 'green';
    }

    document.querySelector('.cancel-btn').addEventListener('click', closeDialog);
    document.querySelector('.confirm-btn').addEventListener('click', confirmAction);

    async function confirmAction() {
      let tokenOptions = {}
      let crumbRes = await fetch('http://112.111.20.89:30024/crumbIssuer/api/json', tokenOptions);
      let crumbJson = await crumbRes.json();
      console.log(crumbJson.crumb)


      let jsonData = {
        "parameter": [{
          "name": "SERVER",
          "value": serviceNameInputEle.value
        },
        {
          "name": "tag",
          "value": tagNameInputEle.value
        },
        {
          "name": "MRE",
          "value": mreInputEle.value
        },
        {
          "name": "JDK",
          "value": jdkInputEle.value
        },
        {
          "name": "REL_VER",
          "value": relVerInputEle.value
        },
        {
          "name": "INSTALL_DEPLOY",
          "value": installDeployInputEle.value
        }
        ],
        "statusCode": "303",
        "JeJenkins-Crumb": crumbJson.crumb,
        "redirectTo": ".",
      };
      const options = {
        method: 'POST',
        body: new URLSearchParams({
          test: '',
          statusCode: '303',
          redirectTo: '.',
          "Jenkins-Crumb": crumbJson.crumb,
          json: JSON.stringify(jsonData)
        })
      };

      await fetch(window.location.href.split("&")[0], options);
      closeDialog();
    }

    function closeDialog() {
      document.getElementsByClassName('confirm-dialog')[0].remove();
      // document.getElementById('overlay').remove();
      document.querySelector(".jenkins-button--primary").style.display = ''
      document.getElementsByClassName("jenkins-form")[0].querySelectorAll("input").forEach(function (inputEle) {
        inputEle.disabled = false;
      })
      document.getElementsByClassName("jenkins-form")[0].querySelectorAll("select").forEach(function (inputEle) {
        inputEle.disabled = false;
      })
    }

    // Set CSS styles using JavaScript
    Object.assign(dialog.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      zIndex: '1000',
      width: '600px',
      padding: '20px',
      boxSizing: 'border-box'
    });

    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: '999'
    });
    return dialog;
  }

  const regexJenkins = /http:\/\/112\.111\.20\.89:30024\/view\/([^\/]+)\/job\/gpx\/build\?delay=0sec/;
  if (regexJenkins.test(window.location.href)) {
    let buildBtn = document.querySelector('.jenkins-button');
    buildBtn.addEventListener('click', function (e) {
      e.preventDefault();
      createConfirmDialog()
      return false;
    })
    buildBtn.addEventListener('submit', function (e) {
      e.preventDefault();
      return false;
    })

    let jenKinsParam = new URLSearchParams(window.location.search)
    if (null != jenKinsParam.get('serviceName')) {
       serviceNameInputEle.value = jenKinsParam.get('serviceName');
    }
    if (null != jenKinsParam.get('tagName')) {
       tagNameInputEle.value = jenKinsParam.get('tagName');
       relVerInputEle.value = jenKinsParam.get('tagName').split("_")[0];
       mreInputEle.value = '版本提测'
    } else {
       tagNameInputEle.value = "origin/";
       mreInputEle.value = "构建部署镜像"
    }
    jdkInputEle.value = "jdk-8";
    installDeployInputEle.value = "否";
    console.log(buildBtn)
  }


  const regexGit = /http:\/\/192\.168\.8\.48\/([^\/]+)\/([^\/]+)\/-\/tags\/([^\/]+)/;
  if (regexGit.test(window.location.href)) {
    let gitUrlMatch = window.location.href.match(regexGit);
    let serviceName = gitUrlMatch[2];
    let tagName = gitUrlMatch[3]
    const userConfirmed = confirm(`点击确定打开新标签页构建Jenkins`);

    if (userConfirmed) {
      GM_openInTab(`http://112.111.20.89:30024/view/%E4%BA%A4%E6%98%93/job/gpx/build?delay=0sec&serviceName=${serviceName}&tagName=${tagName}`, { active: true });
    }
  }
  // Your code here...
})();